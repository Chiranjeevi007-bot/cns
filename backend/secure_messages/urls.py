from django.urls import path
from . import views

urlpatterns = [
    path('', views.message_list, name='message_list'),
    path('<uuid:message_id>/', views.message_detail, name='message_detail'),
    path('sent/', views.sent_messages, name='sent_messages'),
    path('inbox/', views.inbox_messages, name='inbox_messages'),
    path('<uuid:message_id>/read/', views.mark_as_read, name='mark_as_read'),
]