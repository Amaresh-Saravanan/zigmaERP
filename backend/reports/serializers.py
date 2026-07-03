from rest_framework import serializers

from .models import DC, Logsheet, Measurable


class MeasurableSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    entry_date = serializers.DateField()
    location = serializers.CharField()
    temp = serializers.FloatField()
    humi = serializers.FloatField()
    remarks = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        return Measurable(**validated_data).save()

    def update(self, instance, validated_data):
        for field in ('entry_date', 'location', 'temp', 'humi'):
            setattr(instance, field, validated_data[field])
        instance.remarks = validated_data.get('remarks', instance.remarks)
        instance.save()
        return instance


class LogsheetSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    entry_date = serializers.DateField()
    remarks = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        return Logsheet(**validated_data).save()

    def update(self, instance, validated_data):
        instance.entry_date = validated_data['entry_date']
        instance.remarks = validated_data.get('remarks', instance.remarks)
        instance.save()
        return instance


class DCItemSerializer(serializers.Serializer):
    desc = serializers.CharField()
    hsn = serializers.CharField(required=False, allow_blank=True)
    qty = serializers.FloatField(default=0)
    unit = serializers.CharField(default='Kgs')
    rate = serializers.FloatField(default=0)
    amount = serializers.FloatField(default=0)


class DCSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    dc_number = serializers.CharField()
    po_date = serializers.DateField(required=False, allow_null=True)
    dispatch_date = serializers.DateField(required=False, allow_null=True)
    challan_date = serializers.DateField()
    po_ref = serializers.CharField(required=False, allow_blank=True)
    challan_type = serializers.CharField(default='Supply of Goods')
    bill_to_company = serializers.CharField()
    bill_to_address = serializers.CharField(required=False, allow_blank=True)
    bill_to_gst = serializers.CharField(required=False, allow_blank=True)
    tax_rate = serializers.FloatField(default=18)
    items = DCItemSerializer(many=True)
    grand_total = serializers.FloatField(read_only=True)

    @staticmethod
    def _compute_grand_total(items, tax_rate):
        sub_total = sum(item['qty'] * item['rate'] for item in items)
        return round(sub_total * (1 + tax_rate / 100), 2)

    def create(self, validated_data):
        items = validated_data.pop('items')
        grand_total = self._compute_grand_total(items, validated_data.get('tax_rate', 18))
        return DC(items=items, grand_total=grand_total, **validated_data).save()

    def update(self, instance, validated_data):
        items = validated_data.pop('items')
        for field in (
            'dc_number', 'po_date', 'dispatch_date', 'challan_date', 'po_ref',
            'challan_type', 'bill_to_company', 'bill_to_address', 'bill_to_gst', 'tax_rate',
        ):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.items = items
        instance.grand_total = self._compute_grand_total(items, instance.tax_rate)
        instance.save()
        return instance
