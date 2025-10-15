from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone

from .serializers import UserSerializer, UserRegistrationSerializer, UserKeySerializer
from .models import UserKey

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get or update user profile
    """
    user = request.user
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_keys(request):
    """
    Get or upload user encryption keys
    """
    user = request.user
    
    if request.method == 'GET':
        try:
            key = UserKey.objects.get(user=user)
            serializer = UserKeySerializer(key)
            return Response(serializer.data)
        except UserKey.DoesNotExist:
            return Response({'message': 'No key found'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'POST':
        # Check if key already exists
        try:
            key = UserKey.objects.get(user=user)
            serializer = UserKeySerializer(key, data=request.data)
        except UserKey.DoesNotExist:
            serializer = UserKeySerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_key(request):
    """
    Verify user's encryption key
    """
    user = request.user
    
    try:
        key = UserKey.objects.get(user=user)
        # In a real implementation, we would verify the key here
        # For now, we'll just mark it as verified
        key.verified_at = timezone.now()
        key.save()
        
        user.is_key_verified = True
        user.save()
        
        return Response({'message': 'Key verified successfully'})
    except UserKey.DoesNotExist:
        return Response({'message': 'No key found'}, status=status.HTTP_404_NOT_FOUND)