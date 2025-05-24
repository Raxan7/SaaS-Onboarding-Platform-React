# Generated manually for expired status

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meetings', '0006_alter_meeting_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='meeting',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('rescheduled', 'Rescheduled'), ('cancelled', 'Cancelled'), ('completed', 'Completed'), ('started', 'Started'), ('expired', 'Expired')], default='pending', max_length=20),
        ),
    ]
