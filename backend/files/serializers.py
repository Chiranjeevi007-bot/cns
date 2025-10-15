from rest_framework import serializers
from .models import File, FileChunk, FileShare, FileAccessLog

class FileChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileChunk
        fields = ('id', 'chunk_index', 'chunk_hash', 'created_at')
        read_only_fields = ('id', 'created_at')

class FileSerializer(serializers.ModelSerializer):
    chunks = FileChunkSerializer(many=True, read_only=True)
    
    class Meta:
        model = File
        fields = ('id', 'name', 'original_name', 'file_type', 'size', 'encrypted', 
                  'encryption_metadata', 'created_at', 'updated_at', 'chunks')
        read_only_fields = ('id', 'created_at', 'updated_at')

class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id', 'name', 'original_name', 'file_type', 'size', 'encrypted', 'encryption_metadata')
        read_only_fields = ('id',)

class FileShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileShare
        fields = ('id', 'file', 'shared_with', 'access_key', 'created_at', 'expires_at')
        read_only_fields = ('id', 'created_at')

class FileAccessLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileAccessLog
        fields = ('id', 'file', 'user', 'action', 'ip_address', 'user_agent', 'timestamp')
        read_only_fields = ('id', 'timestamp')