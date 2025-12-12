from django.contrib import admin
from .models import Prediction


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ['user', 'predicted_class', 'confidence', 'created_at']
    list_filter = ['created_at', 'predicted_class']
    search_fields = ['user__username', 'predicted_class']
    readonly_fields = ['created_at']
