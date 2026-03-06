from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AppSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("confidence_threshold", models.FloatField(default=0.25)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "App Settings",
                "verbose_name_plural": "App Settings",
            },
        ),
        migrations.CreateModel(
            name="Detection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("image", models.ImageField(upload_to="detections/%Y/%m/%d/")),
                ("condition", models.CharField(choices=[("Fresh", "Fresh"), ("Bruised", "Bruised"), ("Rotten", "Rotten")], max_length=20)),
                ("confidence", models.FloatField()),
                ("grade", models.CharField(choices=[("A", "A"), ("B", "B"), ("C", "C"), ("Reject", "Reject")], max_length=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
