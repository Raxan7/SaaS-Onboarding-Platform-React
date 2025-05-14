from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 
                 'company_name', 'job_title', 'industry', 'avatar']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    user_type = serializers.ChoiceField(
        choices=[('client', 'Client'), ('host', 'Host')],
        default='client',
        write_only=True
    )

    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 'last_name', 'user_type']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def create(self, validated_data):
        user_type = validated_data.pop('user_type', 'client')
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        user.user_type = user_type
        user.save()
        return user