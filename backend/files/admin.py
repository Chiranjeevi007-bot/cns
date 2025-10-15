from django.contrib import admin
from .models import File, FileChunk, FileShare, FileAccessLog

admin.site.register(File)
admin.site.register(FileChunk)
admin.site.register(FileShare)
admin.site.register(FileAccessLog)