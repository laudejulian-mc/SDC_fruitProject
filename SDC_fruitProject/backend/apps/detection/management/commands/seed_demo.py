import io
import random

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone
from PIL import Image

from apps.detection.models import Detection


class Command(BaseCommand):
    help = "Create sample detection records for demo/testing"

    def handle(self, *args, **options):
        conditions = ["Fresh", "Bruised", "Rotten"]
        grades = ["A", "B", "C", "Reject"]

        created = 0
        for index in range(12):
            image = Image.new("RGB", (320, 240), color=(240, 248 - index * 5, 230 - index * 3))
            buffer = io.BytesIO()
            image.save(buffer, format="JPEG")
            file_name = f"sample_{timezone.now().strftime('%Y%m%d_%H%M%S')}_{index}.jpg"

            item = Detection(
                condition=random.choice(conditions),
                confidence=round(random.uniform(0.55, 0.98), 4),
                grade=random.choice(grades),
            )
            item.image.save(file_name, ContentFile(buffer.getvalue()), save=False)
            item.save()
            created += 1

        self.stdout.write(self.style.SUCCESS(f"Created {created} sample detections."))
