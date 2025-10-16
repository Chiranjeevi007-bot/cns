from django.urls import path, include

urlpatterns = [
    path('users/', include('users.urls')),
    path('files/', include('files.urls')),
    path('messages/', include('secure_messages.urls')),
]