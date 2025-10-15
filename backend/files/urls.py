from django.urls import path
from . import views

urlpatterns = [
    path('', views.file_list, name='file_list'),
    path('<uuid:file_id>/', views.file_detail, name='file_detail'),
    path('upload/init/', views.init_file_upload, name='init_file_upload'),
    path('upload/chunk/', views.upload_file_chunk, name='upload_file_chunk'),
    path('upload/complete/', views.complete_file_upload, name='complete_file_upload'),
    path('<uuid:file_id>/download/', views.download_file, name='download_file'),
    path('<uuid:file_id>/share/', views.share_file, name='share_file'),
    path('shared/', views.shared_files, name='shared_files'),
    path('shared/<uuid:share_id>/', views.shared_file_detail, name='shared_file_detail'),
]