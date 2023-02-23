# Generated by Django 4.1.6 on 2023-02-15 20:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common_models', '0003_rename_prefferred_mode_teacher_preferred_mode_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='allotment',
            old_name='allotted_lectures_hours',
            new_name='allotted_lecture_hours'
        ),
        migrations.AlterField(
            model_name='allotment',
            name='allotted_lecture_hours',
            field=models.SmallIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='allotment',
            name='allotted_practical_hours',
            field=models.SmallIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='allotment',
            name='allotted_tutorial_hours',
            field=models.SmallIntegerField(default=0),
        ),
    ]