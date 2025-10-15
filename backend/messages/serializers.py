from rest_framework import serializers
from .models import Message, MessageAttachment, MessageAccessLog
from users.serializers import UserSerializer

class MessageAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageAttachment
        fields = ('id', 'file', 'created_at')
        read_only_fields = ('id', 'created_at')

class MessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    recipient_details = UserSerializer(source='recipient', read_only=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Message
        fields = ('id', 'sender', 'recipient', 'sender_details', 'recipient_details',
                  'subject', 'content', 'encryption_metadata', 'read', 
                  'created_at', 'attachments')
        read_only_fields = ('id', 'created_at', 'read')

class MessageCreateSerializer(serializers.ModelSerializer):
    attachments = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Message
        fields = ('id', 'recipient', 'subject', 'content', 'encryption_metadata', 'attachments')
        read_only_fields = ('id',)

class MessageAccessLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageAccessLog
        fields = ('id', 'message', 'user', 'action', 'ip_address', 'user_agent', 'timestamp')
        read_only_fields = ('id', 'timestamp')