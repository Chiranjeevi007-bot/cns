import uuid
from django.db import models
from django.conf import settings

class File(models.Model):
    """
    Model for storing file metadata
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='files')
    name = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()  # Size in bytes
    encrypted = models.BooleanField(default=True)
    encryption_metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class FileChunk(models.Model):
    """
    Model for storing file chunks
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.IntegerField()
    chunk_data = models.FileField(upload_to='chunks/')
    chunk_hash = models.CharField(max_length=64)  # SHA-256 hash
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('file', 'chunk_index')
    
    def __str__(self):
        return f"{self.file.name} - Chunk {self.chunk_index}"

class FileShare(models.Model):
    """
    Model for tracking file shares
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='shares')
    shared_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shared_files')
    shared_with = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_files')
    access_key = models.TextField(null=True, blank=True)  # Encrypted access key
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.file.name} shared with {self.shared_with.email}"

class FileAccessLog(models.Model):
    """
    Model for audit trail of file access
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='access_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='file_access_logs')
    action = models.CharField(max_length=50)  # upload, download, share, delete
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} {self.action} {self.file.name}"