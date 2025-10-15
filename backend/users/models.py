from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Custom user model for secure file sharing application
    """
    email = models.EmailField(_('email address'), unique=True)
    public_key = models.TextField(blank=True, null=True)
    is_key_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class UserKey(models.Model):
    """
    Model to store user encryption keys
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='key')
    public_key = models.TextField()
    key_fingerprint = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email}'s key"