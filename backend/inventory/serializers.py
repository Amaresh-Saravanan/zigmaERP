from rest_framework import serializers

from inventory.models import Item, Unit


class UnitSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    unit_name = serializers.CharField()
    is_active = serializers.BooleanField(default=True)

    def create(self, validated_data):
        return Unit(**validated_data).save()

    def update(self, instance, validated_data):
        instance.unit_name = validated_data['unit_name']
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        return instance


class UnitRefSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    unit_name = serializers.CharField(read_only=True)


class ItemSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    item_code = serializers.CharField(read_only=True)
    item_name = serializers.CharField()
    unit = UnitRefSerializer()
    is_active = serializers.BooleanField(default=True)

    def validate_unit(self, value):
        try:
            return Unit.objects.get(unique_id=value['unique_id'], is_deleted=False)
        except Unit.DoesNotExist:
            raise serializers.ValidationError('Unit not found.')

    @staticmethod
    def _next_item_code():
        # ponytail: read-then-increment, good enough for single-writer/low-concurrency
        # ERP data entry; move to an atomic counter document if concurrent creates
        # ever collide on item_code.
        last = Item.objects.order_by('-created_at').first()
        last_num = 0
        if last and last.item_code:
            try:
                last_num = int(last.item_code.split('-')[1])
            except (IndexError, ValueError):
                pass
        return f'IT-{last_num + 1:03d}'

    def create(self, validated_data):
        return Item(
            item_name=validated_data['item_name'],
            item_code=self._next_item_code(),
            unit=validated_data['unit'],
            is_active=validated_data.get('is_active', True),
        ).save()

    def update(self, instance, validated_data):
        instance.item_name = validated_data['item_name']
        instance.unit = validated_data['unit']
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        return instance
