from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API root endpoint
    """
    return Response({
        'status': 'API is running',
        'version': '1.0.0'
    }, status=status.HTTP_200_OK)