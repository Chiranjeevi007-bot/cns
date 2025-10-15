from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserKey

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_key_verified', 'created_at')
        read_only_fields = ('id', 'created_at', 'is_key_verified')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data.pop('confirm_password'):
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserKey
        fields = ('id', 'public_key', 'key_fingerprint', 'created_at', 'verified_at')
        read_only_fields = ('id', 'created_at', 'verified_at')