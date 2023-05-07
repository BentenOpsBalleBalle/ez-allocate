# Generated by Django 4.1.7 on 2023-04-24 08:57

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("common_models", "0006_alter_celeryfileresults_id"),
    ]

    operations = [
        migrations.AlterField(
            model_name="subject",
            name="_allotment_status",
            field=models.CharField(
                choices=[
                    ("NONE", "None"),
                    ("PART", "Partial"),
                    ("FULL", "Full"),
                    ("OVER", "Extra Full"),
                ],
                default="NONE",
                max_length=4,
            ),
        ),
        migrations.AlterField(
            model_name="teacher",
            name="_assigned_status",
            field=models.CharField(
                choices=[
                    ("NONE", "None"),
                    ("PART", "Partial"),
                    ("FULL", "Full"),
                    ("OVER", "Extra Full"),
                ],
                default="NONE",
                max_length=4,
            ),
        ),
    ]
