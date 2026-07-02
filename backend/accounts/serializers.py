from django.contrib.auth.hashers import check_password
from rest_framework import serializers

from accounts.models import User


class UserTypeSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    type_name = serializers.CharField()


class UserSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    user_name = serializers.CharField()
    user_email = serializers.CharField(required=False)
    user_type = UserTypeSerializer()
    screens = serializers.SerializerMethodField()
    main_screens = serializers.SerializerMethodField()
    is_active = serializers.BooleanField()

    def get_screens(self, obj):
        return obj.screens.split(',') if obj.screens else []

    def get_main_screens(self, obj):
        return obj.main_screens.split(',') if obj.main_screens else []


class LoginSerializer(serializers.Serializer):
    user_name = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(user_name=data['user_name'], is_deleted=False)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid credentials')

        if not user.is_active:
            raise serializers.ValidationError('Account is inactive')

        if not check_password(data['password'], user.password_hash):
            raise serializers.ValidationError('Invalid credentials')

        data['user'] = user
        return data
