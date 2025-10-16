from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Message, MessageAttachment, MessageAccessLog
from .serializers import MessageSerializer, MessageCreateSerializer
from files.models import File

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def message_list(request):
    """
    List all messages or create a new message
    """
    if request.method == 'GET':
        messages = Message.objects.filter(
            Q(sender=request.user) | Q(recipient=request.user)
        ).order_by('-created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = MessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Create message
            message = serializer.save(sender=request.user)
            
            # Add attachments if provided
            attachments = serializer.validated_data.get('attachments', [])
            for file_id in attachments:
                try:
                    file = File.objects.get(pk=file_id, owner=request.user)
                    MessageAttachment.objects.create(message=message, file=file)
                except File.DoesNotExist:
                    pass
            
            # Log message send
            MessageAccessLog.objects.create(
                message=message,
                user=request.user,
                action='send',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
            
            return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def message_detail(request, message_id):
    """
    Retrieve or delete a message
    """
    try:
        message = Message.objects.get(pk=message_id)
        # Check if user is either sender or recipient
        if message.sender != request.user and message.recipient != request.user:
            return Response({"error": "You don't have permission to access this message"}, 
                           status=status.HTTP_403_FORBIDDEN)
    except Message.DoesNotExist:
        return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # If recipient is viewing, mark as read
        if message.recipient == request.user and not message.read:
            message.read = True
            message.save()
            
            # Log message read
            MessageAccessLog.objects.create(
                message=message,
                user=request.user,
                action='read',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
        
        serializer = MessageSerializer(message)
        return Response(serializer.data)
    
    elif request.method == 'DELETE':
        # Log message delete
        MessageAccessLog.objects.create(
            message=message,
            user=request.user,
            action='delete',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sent_messages(request):
    """
    List messages sent by the user
    """
    messages = Message.objects.filter(sender=request.user).order_by('-created_at')
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inbox_messages(request):
    """
    List messages received by the user
    """
    messages = Message.objects.filter(recipient=request.user).order_by('-created_at')
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_read(request, message_id):
    """
    Mark a message as read
    """
    message = get_object_or_404(Message, pk=message_id, recipient=request.user)
    
    if not message.read:
        message.read = True
        message.save()
        
        # Log message read
        MessageAccessLog.objects.create(
            message=message,
            user=request.user,
            action='read',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
    
    return Response({'message': 'Message marked as read'})