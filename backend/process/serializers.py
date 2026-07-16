from django.core.validators import RegexValidator
from rest_framework import serializers

from accounts.models import User
from core.utils import next_entry_no
from inventory.models import Item, Pit, Supplier, Tray
from inventory.serializers import UnitRefSerializer
from process.models import (
    CullingProcess,
    DryProcess,
    EggProcess,
    EggProcessAddon,
    FrpStatusUpdate,
    FrpTrayProcess,
    Leachate,
    MaterialReceived,
    OvenProcess,
    PitStatus,
    StatusUpdate,
)

# ── Small ref serializers: {unique_id} on write, display field on read ──


class SupplierRefSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    supplier_name = serializers.CharField(read_only=True)


class ItemRefSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    item_name = serializers.CharField(read_only=True)


class PitRefSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    pit_name = serializers.CharField(read_only=True)


class TrayRefSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    bin_name = serializers.CharField(read_only=True)


class UserRefSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    user_name = serializers.CharField(read_only=True)


class MaterialReceivedRefSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    batch_id = serializers.CharField(read_only=True)


class FrpTrayProcessRefSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    batch = MaterialReceivedRefSerializer(read_only=True)


def _resolve(model, value, label):
    try:
        return model.objects.get(unique_id=value['unique_id'], is_deleted=False)
    except model.DoesNotExist:
        raise serializers.ValidationError(f'{label} not found.')


# ── Material Received ──

class MaterialReceivedSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    date = serializers.DateField()
    supplier = SupplierRefSerializer()
    item = ItemRefSerializer()
    qty = serializers.FloatField()
    unit = UnitRefSerializer()
    invoice_no = serializers.CharField(required=False, allow_blank=True)
    invoice_date = serializers.DateField(required=False, allow_null=True)
    batch_id = serializers.CharField(read_only=True)
    batch_status = serializers.ChoiceField(choices=MaterialReceived.batch_status.choices, read_only=True)

    def validate_supplier(self, value):
        return _resolve(Supplier, value, 'Supplier')

    def validate_item(self, value):
        return _resolve(Item, value, 'Item')

    def validate_unit(self, value):
        from inventory.models import Unit
        return _resolve(Unit, value, 'Unit')

    @staticmethod
    def _batch_prefix(item):
        name = item.item_name.lower()
        if 'egg' in name:
            return 'EGG'
        if 'larvae' in name:
            return 'LAR'
        return 'BAT'

    @classmethod
    def _next_batch_id(cls, item, supplier):
        prefix = f'{cls._batch_prefix(item)}-{(supplier.label or "GEN").upper()}-'
        last = MaterialReceived.objects.filter(batch_id__startswith=prefix).order_by('-created_at').first()
        return next_entry_no(prefix, last.batch_id if last else None)

    def create(self, validated_data):
        return MaterialReceived(
            batch_id=self._next_batch_id(validated_data['item'], validated_data['supplier']),
            **validated_data,
        ).save()

    def update(self, instance, validated_data):
        for field in ('date', 'supplier', 'item', 'qty', 'unit', 'invoice_no', 'invoice_date'):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


# ── Culling Process ──

class CullingProcessSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    entry_date = serializers.DateField()
    shift_type = serializers.ChoiceField(choices=CullingProcess.shift_type.choices)
    cylinder_type = serializers.ChoiceField(choices=CullingProcess.cylinder_type.choices)
    cylinder_no = serializers.CharField()
    starting_weight = serializers.FloatField()
    ending_weight = serializers.FloatField()
    fuel_consumption = serializers.FloatField(required=False)
    raw_material_weight = serializers.FloatField()
    final_larvae_weight = serializers.FloatField()
    work_done = serializers.ChoiceField(choices=CullingProcess.work_done.choices)
    others_remarks = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs.get('fuel_consumption') is None:
            attrs['fuel_consumption'] = round(attrs['starting_weight'] - attrs['ending_weight'], 2)
        if attrs.get('work_done') == '3' and not attrs.get('others_remarks'):
            raise serializers.ValidationError({'others_remarks': 'Required when work done is Others.'})
        return attrs

    def create(self, validated_data):
        return CullingProcess(**validated_data).save()

    def update(self, instance, validated_data):
        for field in (
            'entry_date', 'shift_type', 'cylinder_type', 'cylinder_no', 'starting_weight',
            'ending_weight', 'fuel_consumption', 'raw_material_weight', 'final_larvae_weight',
            'work_done', 'others_remarks',
        ):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


# ── Oven Process ──

_HH_MM = RegexValidator(r'^\d{2}:\d{2}$', message='Expected HH:MM.')


class OvenProcessSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    entry_date = serializers.DateField()
    starting_time = serializers.CharField(validators=[_HH_MM])
    closing_time = serializers.CharField(validators=[_HH_MM])
    running_hours = serializers.FloatField(required=False)
    diesel_topup = serializers.FloatField()
    raw_larvae_process = serializers.FloatField()
    dried_larvae_production = serializers.FloatField()
    dried_larvae_stock = serializers.FloatField()
    image_path = serializers.CharField(required=False, allow_blank=True)

    @staticmethod
    def _to_minutes(hhmm):
        hours, minutes = (int(p) for p in hhmm.split(':'))
        return hours * 60 + minutes

    def validate(self, attrs):
        if attrs.get('running_hours') is None:
            start = self._to_minutes(attrs['starting_time'])
            end = self._to_minutes(attrs['closing_time'])
            if end < start:
                end += 24 * 60  # overnight shift
            attrs['running_hours'] = round((end - start) / 60, 2)
        return attrs

    def create(self, validated_data):
        return OvenProcess(**validated_data).save()

    def update(self, instance, validated_data):
        for field in (
            'entry_date', 'starting_time', 'closing_time', 'running_hours', 'diesel_topup',
            'raw_larvae_process', 'dried_larvae_production', 'dried_larvae_stock', 'image_path',
        ):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


# ── Dry Process ──

class DryProcessSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    date = serializers.DateField()
    type = serializers.ChoiceField(choices=DryProcess.type.choices)
    drying_method = serializers.ChoiceField(choices=DryProcess.drying_method.choices)
    quantity = serializers.FloatField()
    qty_manure = serializers.FloatField(required=False)
    image_path = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        return DryProcess(**validated_data).save()

    def update(self, instance, validated_data):
        for field in ('date', 'type', 'drying_method', 'quantity', 'qty_manure', 'image_path'):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


# ── Leachate ──

class LeachateSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    entry_date = serializers.DateField()
    qty_leachate = serializers.FloatField()
    remarks = serializers.CharField(required=False, allow_blank=True)
    image_path = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        return Leachate(**validated_data).save()

    def update(self, instance, validated_data):
        for field in ('entry_date', 'qty_leachate', 'remarks', 'image_path'):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


# ── Egg Process ──

class EggProcessAddonSerializer(serializers.Serializer):
    item = ItemRefSerializer()
    qty = serializers.FloatField()

    def validate_item(self, value):
        item = _resolve(Item, value, 'Item')
        from process.models import ALLOWED_ADDON_ITEM_IDS
        if item.unique_id not in ALLOWED_ADDON_ITEM_IDS:
            raise serializers.ValidationError('This item is not allowed as an add-on.')
        return item


class EggProcessSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    entry_no = serializers.CharField(read_only=True)
    entry_date = serializers.DateField()
    staff = UserRefSerializer()
    supplier = SupplierRefSerializer()
    batch = MaterialReceivedRefSerializer()
    tot_qty = serializers.FloatField()
    tray_utilized = serializers.IntegerField()
    trays = TrayRefSerializer(many=True, required=False)
    addons = EggProcessAddonSerializer(many=True, required=False)

    def validate_staff(self, value):
        return _resolve(User, value, 'Staff')

    def validate_supplier(self, value):
        return _resolve(Supplier, value, 'Supplier')

    def validate_batch(self, value):
        batch = _resolve(MaterialReceived, value, 'Batch')
        # ponytail: only guard on create — batch isn't in the update whitelist, so it can't
        # be swapped onto an existing EggProcess anyway.
        if self.instance is None and batch.batch_status != 'pending':
            raise serializers.ValidationError('This batch has already been used.')
        return batch

    def validate_trays(self, value):
        return [_resolve(Tray, v, 'Tray') for v in value]

    def validate(self, attrs):
        # Same-day edit restriction (admin exempt via user_type)
        if self.instance:
            from datetime import date
            if self.instance.entry_date != date.today():
                user = self.context['request'].user
                if not (user.user_type and user.user_type.type_name == 'Admin'):
                    raise serializers.ValidationError('Only today\'s records can be edited.')
            # Block edit if hatching has started
            has_hatching = StatusUpdate.objects(
                batch=self.instance.batch,
                hatching_status__in=['progressing', 'completed'],
                is_deleted=False
            ).first()
            if has_hatching:
                raise serializers.ValidationError('Cannot edit: hatching is in progress or completed.')
        trays = attrs.get('trays', [])
        if trays and len(trays) != attrs.get('tray_utilized', getattr(self.instance, 'tray_utilized', None)):
            raise serializers.ValidationError({'trays': 'Number of trays must match tray utilized.'})
        return attrs

    @staticmethod
    def _next_entry_no():
        last = EggProcess.objects.order_by('-created_at').first()
        return next_entry_no('EPC-', last.entry_no if last else None)

    def create(self, validated_data):
        addons_data = validated_data.pop('addons', [])
        batch = validated_data['batch']
        instance = EggProcess(
            entry_no=self._next_entry_no(),
            addons=[EggProcessAddon(**addon) for addon in addons_data],
            **validated_data,
        ).save()
        batch.batch_status = 'used'
        batch.save()
        return instance

    def update(self, instance, validated_data):
        addons_data = validated_data.pop('addons', None)
        for field in ('entry_date', 'staff', 'supplier', 'tot_qty', 'tray_utilized', 'trays'):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        if addons_data is not None:
            instance.addons = [EggProcessAddon(**addon) for addon in addons_data]
        instance.save()
        return instance


# ── Status Update ──

class StatusUpdateSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    entry_date = serializers.DateField()
    staff = UserRefSerializer()
    batch = MaterialReceivedRefSerializer()
    day = serializers.IntegerField()
    hatching_status = serializers.ChoiceField(choices=StatusUpdate.hatching_status.choices, default='pending')
    remarks = serializers.CharField(required=False, allow_blank=True)

    def validate_staff(self, value):
        return _resolve(User, value, 'Staff')

    def validate_batch(self, value):
        return _resolve(MaterialReceived, value, 'Batch')

    def create(self, validated_data):
        return StatusUpdate(**validated_data).save()

    def update(self, instance, validated_data):
        for field in ('entry_date', 'staff', 'day', 'hatching_status', 'remarks'):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


# ── Pit Status (org_status 1-7, '6' = legacy Screening Process) ──

_PIT_STATUS_REQUIRED_FIELDS = {
    '1': ('feed_qty', 'feed_count'),
    '2': ('batch', 'trays', 'larvae_qty_in'),
    '3': ('method',),
    '4': ('measure_time', 'temp_start', 'temp_mid', 'temp_end', 'humi_start', 'humi_mid', 'humi_end'),
    '5': ('larvae_qty', 'qty_manure_1', 'qty_manure_2', 'qty_manure_3', 'qty_rejets', 'harvest_comp'),
    '6': ('larvae_qty', 'qty_manure_1', 'qty_manure_2', 'qty_rejets'),
    '7': ('tippi_qty',),
}

# Editable fields per org_status on PATCH (never allow org_status/entry_date/pit/form_batch_id changes)
_PIT_STATUS_EDITABLE_FIELDS = {
    '1': ('feed_qty', 'feed_count', 'notes'),
    '2': ('batch', 'trays', 'larvae_qty_in', 'notes'),
    '3': ('method', 'notes'),
    '4': ('measure_time', 'temp_start', 'temp_mid', 'temp_end', 'humi_start', 'humi_mid', 'humi_end', 'notes'),
    '5': ('larvae_qty', 'qty_manure_1', 'qty_manure_2', 'qty_manure_3', 'qty_rejets', 'harvest_comp', 'notes'),
    '6': ('larvae_qty', 'qty_manure_1', 'qty_manure_2', 'qty_rejets', 'notes'),
    '7': ('tippi_qty', 'notes'),
}


class PitStatusSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    entry_date = serializers.DateField()
    pit = PitRefSerializer()
    org_status = serializers.ChoiceField(choices=PitStatus.org_status.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
    form_batch_id = serializers.CharField(read_only=True)

    feed_qty = serializers.FloatField(required=False, allow_null=True)
    feed_count = serializers.IntegerField(required=False, allow_null=True)

    batch = MaterialReceivedRefSerializer(required=False)
    trays = TrayRefSerializer(many=True, required=False)
    larvae_qty_in = serializers.FloatField(required=False, allow_null=True)

    method = serializers.CharField(required=False, allow_blank=True)

    measure_time = serializers.ChoiceField(choices=PitStatus.measure_time.choices, required=False, allow_null=True)
    temp_start = serializers.FloatField(required=False, allow_null=True)
    temp_mid = serializers.FloatField(required=False, allow_null=True)
    temp_end = serializers.FloatField(required=False, allow_null=True)
    humi_start = serializers.FloatField(required=False, allow_null=True)
    humi_mid = serializers.FloatField(required=False, allow_null=True)
    humi_end = serializers.FloatField(required=False, allow_null=True)

    larvae_qty = serializers.FloatField(required=False, allow_null=True)
    qty_manure_1 = serializers.FloatField(required=False, allow_null=True)
    qty_manure_2 = serializers.FloatField(required=False, allow_null=True)
    qty_manure_3 = serializers.FloatField(required=False, allow_null=True)
    qty_rejets = serializers.FloatField(required=False, allow_null=True)
    harvest_comp = serializers.ChoiceField(choices=PitStatus.harvest_comp.choices, required=False, allow_null=True)

    tippi_qty = serializers.FloatField(required=False, allow_null=True)

    def validate_pit(self, value):
        return _resolve(Pit, value, 'Pit')

    def validate_batch(self, value):
        return _resolve(MaterialReceived, value, 'Batch')

    def validate_trays(self, value):
        return [_resolve(Tray, v, 'Tray') for v in value]

    def validate(self, attrs):
        org_status = attrs.get('org_status', getattr(self.instance, 'org_status', None))
        for field in _PIT_STATUS_REQUIRED_FIELDS.get(org_status, ()):
            value = attrs.get(field, getattr(self.instance, field, None) if self.instance else None)
            if value in (None, '', []):
                raise serializers.ValidationError({field: 'Required for this status.'})
        return attrs

    @staticmethod
    def _next_form_batch_id(pit):
        suffix = ''.join(c for c in pit.pit_name if c.isalnum())[-2:].upper() or 'PT'
        prefix = f'PIT-{suffix}-'
        last = PitStatus.objects.filter(form_batch_id__startswith=prefix).order_by('-created_at').first()
        return next_entry_no(prefix, last.form_batch_id if last else None)

    def create(self, validated_data):
        return PitStatus(
            form_batch_id=self._next_form_batch_id(validated_data['pit']),
            **validated_data,
        ).save()

    def update(self, instance, validated_data):
        # ponytail: explicit field whitelist per org_status closes mass-assignment hole.
        # org_status, entry_date, pit, form_batch_id are never updated (immutable identity fields).
        editable = _PIT_STATUS_EDITABLE_FIELDS.get(instance.org_status, ())
        for field in editable:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


# ── FRP Tray Process ──

class FrpTrayProcessSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    entry_date = serializers.DateField()
    batch = MaterialReceivedRefSerializer()
    frp_tray_count = serializers.IntegerField()
    trays = TrayRefSerializer(many=True, required=False)
    batch_status = serializers.ChoiceField(choices=FrpTrayProcess.batch_status.choices, read_only=True)

    def validate_batch(self, value):
        return _resolve(MaterialReceived, value, 'Batch')

    def validate_trays(self, value):
        return [_resolve(Tray, v, 'Tray') for v in value]

    def validate(self, attrs):
        trays = attrs.get('trays', [])
        if trays and len(trays) != attrs.get('frp_tray_count', getattr(self.instance, 'frp_tray_count', None)):
            raise serializers.ValidationError({'trays': 'Number of trays must match FRP tray count.'})
        return attrs

    def create(self, validated_data):
        instance = FrpTrayProcess(**validated_data).save()
        # Close the egg process batch (mark as converted to FRP)
        egg = EggProcess.objects(batch=instance.batch, is_deleted=False).first()
        if egg:
            egg.batch.batch_status = 'closed'
            egg.batch.save()
        return instance

    def update(self, instance, validated_data):
        for field in ('entry_date', 'frp_tray_count', 'trays'):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


# ── FRP Status Update ──

class FrpStatusUpdateSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    entry_no = serializers.CharField(read_only=True)
    entry_date = serializers.DateField()
    staff = UserRefSerializer()
    batch = FrpTrayProcessRefSerializer()
    day = serializers.IntegerField()
    hatching_status = serializers.ChoiceField(choices=FrpStatusUpdate.hatching_status.choices, default='pending')
    remarks = serializers.CharField(required=False, allow_blank=True)
    image_path = serializers.CharField(required=False, allow_blank=True)

    def validate_staff(self, value):
        return _resolve(User, value, 'Staff')

    def validate_batch(self, value):
        return _resolve(FrpTrayProcess, value, 'FRP batch')

    @staticmethod
    def _next_entry_no():
        # order by -entry_no (fixed prefix + zero-padded => lexical == numeric); skip legacy docs with no entry_no
        last = FrpStatusUpdate.objects(entry_no__nin=[None, '']).order_by('-entry_no').first()
        return next_entry_no('FRP-', last.entry_no if last else None)

    def create(self, validated_data):
        return FrpStatusUpdate(entry_no=self._next_entry_no(), **validated_data).save()

    def update(self, instance, validated_data):
        for field in ('entry_date', 'staff', 'day', 'hatching_status', 'remarks', 'image_path'):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance
