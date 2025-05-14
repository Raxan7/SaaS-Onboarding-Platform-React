from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.contrib.admin import SimpleListFilter
from .models import Meeting

class IsConfirmedFilter(SimpleListFilter):
    title = _('is confirmed')
    parameter_name = 'is_confirmed'

    def lookups(self, request, model_admin):
        return (
            ('yes', _('Yes')),
            ('no', _('No')),
        )

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(status='confirmed')
        if self.value() == 'no':
            return queryset.exclude(status='confirmed')

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'scheduled_at', 'is_confirmed', 'is_qualified')
    search_fields = ('user__email', 'title')
    list_filter = (IsConfirmedFilter, 'is_qualified')
