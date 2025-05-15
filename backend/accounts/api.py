from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework import permissions
from rest_framework import generics
from rest_framework import status
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.conf import settings
import os
import logging

from .serializers import User, UserRegisterSerializer, UserSerializer

# accounts/api.py
class UserRegisterAPIView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'user_type': user.user_type
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EmailAuthTokenSerializer(AuthTokenSerializer):
    username = None  # Remove the username field completely
    email = serializers.EmailField(label="Email", write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Use Django's authenticate with email as username
            user = authenticate(request=self.context.get('request'),
                              username=email, password=password)
            
            if not user:
                msg = 'Unable to log in with provided credentials.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'Must include "email" and "password".'
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs

class CustomAuthToken(ObtainAuthToken):
    serializer_class = EmailAuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                         context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'user_type': user.user_type,
            'first_name': user.first_name,
            'last_name': user.last_name
        })
    

class UserDetailAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    

# accounts/api.py
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    token = get_token(request)
    response = Response({'detail': 'CSRF cookie set', 'token': token})
    
    # Get settings from Django settings
    secure = not settings.DEBUG
    samesite = 'None' if not settings.DEBUG else 'Lax'
    
    try:
        # Try to set the cookie with all attributes including partitioned
        response.set_cookie(
            'csrftoken',
            token,
            max_age=60 * 60 * 24 * 7,  # 1 week
            secure=secure,
            httponly=False,
            samesite=samesite,
            domain=None  # Let browser handle the domain
        )
        
        # Manually add Partitioned attribute to cookie header
        for key, value in response.cookies.items():
            if key == 'csrftoken':
                cookie_str = value.output(header='').strip()
                if 'Partitioned' not in cookie_str:
                    response.headers.setdefault('Set-Cookie', '')
                    # Create a new cookie string with Partitioned attribute
                    response.headers['Set-Cookie'] = f"{cookie_str}; Partitioned"
    
    except Exception as e:
        # Fallback to standard cookie setting without partitioned attribute
        logger = logging.getLogger(__name__)
        logger.error(f"Error setting CSRF cookie with partitioned attribute: {str(e)}")
        
        response.set_cookie(
            'csrftoken',
            token,
            max_age=60 * 60 * 24 * 7,  # 1 week
            secure=secure,
            httponly=False,
            samesite=samesite,
            domain=None  # Let browser handle the domain
        )
    
    return response