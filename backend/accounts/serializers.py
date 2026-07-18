import re

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


class SignupSerializer(serializers.Serializer):
    """Public self-registration. Accounts start is_active=False under the
    zero-permission 'Pending Signup' role until an admin reviews and assigns
    a real UserType via the existing User management screen."""
    user_name = serializers.CharField(min_length=3, max_length=50)
    user_email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)

    def validate_user_name(self, value):
        if not re.match(r'^[A-Za-z0-9_]+$', value):
            raise serializers.ValidationError(
                'Username may only contain letters, numbers, and underscores.'
            )
        if User.objects.filter(user_name__iexact=value, is_deleted=False).first():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_user_email(self, value):
        if User.objects.filter(user_email__iexact=value, is_deleted=False).first():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate_password(self, value):
        rule = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$'
        if not re.match(rule, value):
            raise serializers.ValidationError(
                'Password must be at least 8 characters and include an uppercase '
                'letter, a lowercase letter, a number, and a special character.'
            )
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        pending_type = UserType.get_or_create_pending()
        return User(
            user_name=validated_data['user_name'],
            password_hash=make_password(validated_data['password']),
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            user_email=validated_data['user_email'],
            user_type=pending_type,
            is_active=False,
        ).save()


# ── Management CRUD (TASK-B07) — distinct from the auth-response serializers
# above, which are read-only views shaped for the login/me payload. ──

class UserTypeManageSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    type_name = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    main_screens = serializers.CharField(required=False, allow_blank=True)
    screens = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(default=True)

    def create(self, validated_data):
        return UserType(**validated_data).save()

    def update(self, instance, validated_data):
        instance.type_name = validated_data['type_name']
        instance.description = validated_data.get('description', instance.description)
        instance.main_screens = validated_data.get('main_screens', instance.main_screens)
        instance.screens = validated_data.get('screens', instance.screens)
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
        # A new user with no explicit screens/main_screens inherits their role's
        # (UserType's) default permission set, so assigning a role is enough to
        # grant access - no separate per-user permission step required.
        user_type = validated_data['user_type']
        return User(
            emp_id=validated_data.get('emp_id', ''),
            user_name=validated_data['user_name'],
            password_hash=make_password(validated_data['password']),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_email=validated_data.get('user_email', ''),
            user_type=user_type,
            is_active=validated_data.get('is_active', True),
            screens=validated_data.get('screens') or user_type.screens,
            main_screens=validated_data.get('main_screens') or user_type.main_screens,
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
