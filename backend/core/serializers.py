from rest_framework import serializers

from core.models import MainScreen, Screen


class MainScreenSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    screen_main_name = serializers.CharField()
    icon_name = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(default=True)

    def create(self, validated_data):
        return MainScreen(**validated_data).save()

    def update(self, instance, validated_data):
        instance.screen_main_name = validated_data['screen_main_name']
        instance.icon_name = validated_data.get('icon_name', instance.icon_name)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        return instance


class MainScreenRefSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    screen_main_name = serializers.CharField(read_only=True)


class ScreenSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    screen_name = serializers.CharField()
    folder_name = serializers.CharField()
    icon_name = serializers.CharField(required=False, allow_blank=True)
    main_screen = MainScreenRefSerializer()
    order_no = serializers.IntegerField(default=0)
    is_active = serializers.BooleanField(default=True)

    def validate_main_screen(self, value):
        try:
            return MainScreen.objects.get(unique_id=value['unique_id'], is_deleted=False)
        except MainScreen.DoesNotExist:
            raise serializers.ValidationError('Main screen not found.')

    def create(self, validated_data):
        return Screen(**validated_data).save()

    def update(self, instance, validated_data):
        for field in ('screen_name', 'folder_name', 'icon_name', 'main_screen', 'order_no'):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        return instance
