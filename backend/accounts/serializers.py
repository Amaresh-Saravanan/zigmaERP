from django.contrib.auth.hashers import check_password, make_password
from rest_framework import serializers

from accounts.models import User, UserType


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


# ── Management CRUD (TASK-B07) — distinct from the auth-response serializers
# above, which are read-only views shaped for the login/me payload. ──

class UserTypeManageSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    type_name = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(default=True)

    def create(self, validated_data):
        return UserType(**validated_data).save()

    def update(self, instance, validated_data):
        instance.type_name = validated_data['type_name']
        instance.description = validated_data.get('description', instance.description)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        return instance


class UserTypeRefSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    type_name = serializers.CharField(read_only=True)


class UserManageSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    emp_id = serializers.CharField(required=False, allow_blank=True)
    user_name = serializers.CharField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    user_email = serializers.EmailField(required=False, allow_blank=True)
    user_type = UserTypeRefSerializer()
    is_active = serializers.BooleanField(default=True)
    screens = serializers.CharField(required=False, allow_blank=True)
    main_screens = serializers.CharField(required=False, allow_blank=True)

    def validate_user_type(self, value):
        try:
            return UserType.objects.get(unique_id=value['unique_id'], is_deleted=False)
        except UserType.DoesNotExist:
            raise serializers.ValidationError('User type not found.')

    def validate(self, data):
        # Required on create, optional on update (blank/omitted = keep existing hash).
        if self.instance is None and not data.get('password'):
            raise serializers.ValidationError({'password': 'This field is required.'})
        return data

    def create(self, validated_data):
        return User(
            emp_id=validated_data.get('emp_id', ''),
            user_name=validated_data['user_name'],
            password_hash=make_password(validated_data['password']),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_email=validated_data.get('user_email', ''),
            user_type=validated_data['user_type'],
            is_active=validated_data.get('is_active', True),
            screens=validated_data.get('screens', ''),
            main_screens=validated_data.get('main_screens', ''),
        ).save()

    def update(self, instance, validated_data):
        for field in ('emp_id', 'user_name', 'first_name', 'last_name', 'user_email', 'user_type', 'screens', 'main_screens'):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.is_active = validated_data.get('is_active', instance.is_active)
        if validated_data.get('password'):
            instance.password_hash = make_password(validated_data['password'])
        instance.save()
        return instance
