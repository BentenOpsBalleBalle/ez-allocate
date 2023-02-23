# Generated by Django 4.1.6 on 2023-02-20 09:34

import common_models.utils.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common_models', '0004_rename_allotment_allotted_lectures_hours_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teacher',
            name='preferred_mode',
            field=models.CharField(default='LTP', max_length=3, validators=[common_models.utils.validators.teacher_model_validate_ltp_preference]),
        ),
    ]