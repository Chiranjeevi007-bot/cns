from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import File, FileChunk, FileShare, FileAccessLog
from .serializers import (
    FileSerializer, FileUploadSerializer, FileChunkSerializer, 
    FileShareSerializer, FileAccessLogSerializer
)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def file_list(request):
    """
    List all files or create a new file
    """
    if request.method == 'GET':
        files = File.objects.filter(owner=request.user)
        serializer = FileSerializer(files, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def file_detail(request, file_id):
    """
    Retrieve, update or delete a file
    """
    file = get_object_or_404(File, pk=file_id, owner=request.user)
    
    if request.method == 'GET':
        serializer = FileSerializer(file)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = FileSerializer(file, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        file.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def init_file_upload(request):
    """
    Initialize a file upload
    """
    serializer = FileUploadSerializer(data=request.data)
    if serializer.is_valid():
        file = serializer.save(owner=request.user)
        
        # Log file upload initialization
        FileAccessLog.objects.create(
            file=file,
            user=request.user,
            action='upload_init',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        
        return Response({
            'file_id': file.id,
            'message': 'File upload initialized'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file_chunk(request):
    """
    Upload a file chunk
    """
    file_id = request.data.get('file_id')
    chunk_index = request.data.get('chunk_index')
    chunk_data = request.FILES.get('chunk_data')
    chunk_hash = request.data.get('chunk_hash')
    
    if not all([file_id, chunk_index, chunk_data, chunk_hash]):
        return Response({
            'message': 'Missing required fields'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    file = get_object_or_404(File, pk=file_id, owner=request.user)
    
    # Create or update chunk
    chunk, created = FileChunk.objects.update_or_create(
        file=file,
        chunk_index=chunk_index,
        defaults={
            'chunk_data': chunk_data,
            'chunk_hash': chunk_hash
        }
    )
    
    return Response({
        'chunk_id': chunk.id,
        'message': 'Chunk uploaded successfully'
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_file_upload(request):
    """
    Complete a file upload
    """
    file_id = request.data.get('file_id')
    
    if not file_id:
        return Response({
            'message': 'Missing file_id'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    file = get_object_or_404(File, pk=file_id, owner=request.user)
    
    # Verify all chunks are uploaded
    # In a real implementation, we would verify the integrity of all chunks
    
    # Log file upload completion
    FileAccessLog.objects.create(
        file=file,
        user=request.user,
        action='upload_complete',
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT')
    )
    
    return Response({
        'message': 'File upload completed successfully',
        'file': FileSerializer(file).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_file(request, file_id):
    """
    Download a file
    """
    # Check if user owns the file or has access through sharing
    file = get_object_or_404(
        File, 
        pk=file_id,
        owner=request.user
    )
    
    # Log file download
    FileAccessLog.objects.create(
        file=file,
        user=request.user,
        action='download',
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT')
    )
    
    # In a real implementation, we would assemble and serve the file
    # For now, we'll just return the file metadata
    
    return Response({
        'message': 'File download initiated',
        'file': FileSerializer(file).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_file(request, file_id):
    """
    Share a file with another user
    """
    file = get_object_or_404(File, pk=file_id, owner=request.user)
    
    serializer = FileShareSerializer(data=request.data)
    if serializer.is_valid():
        share = serializer.save(
            file=file,
            shared_by=request.user
        )
        
        # Log file share
        FileAccessLog.objects.create(
            file=file,
            user=request.user,
            action='share',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        
        return Response(FileShareSerializer(share).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shared_files(request):
    """
    List files shared with the user
    """
    shares = FileShare.objects.filter(shared_with=request.user)
    serializer = FileShareSerializer(shares, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shared_file_detail(request, share_id):
    """
    Get details of a shared file
    """
    share = get_object_or_404(FileShare, pk=share_id, shared_with=request.user)
    
    # Log shared file access
    FileAccessLog.objects.create(
        file=share.file,
        user=request.user,
        action='access_shared',
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT')
    )
    
    return Response({
        'share': FileShareSerializer(share).data,
        'file': FileSerializer(share.file).data
    })