from rest_framework import serializers

class SignUpSerializer(serializers.Serializer):
    user_name = serializers.CharField(max_length=255)
    user_title = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True,max_length=255)
    user_image = serializers.ImageField(required=False)

class LoginSerializer(serializers.Serializer):
    user_title = serializers.CharField()
    password = serializers.CharField(write_only=True)
