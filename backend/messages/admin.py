from django.contrib import admin
from .models import Message, MessageAttachment, MessageAccessLog

admin.site.register(Message)
admin.site.register(MessageAttachment)
admin.site.register(MessageAccessLog)