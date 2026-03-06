"""Management command to seed the database with realistic dummy detection records."""
import random
from datetime import timedelta
from io import BytesIO

from PIL import Image as PILImage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from detection.models import DetectionRecord


LABELS_BY_FRUIT = {
    "apple":  ["Fresh", "Rotten"],
    "orange": ["Fresh", "Rotten"],
    "mango":  ["Fresh", "Rotten"],
    "grapes": ["Fresh", "Rotten"],
    "banana": ["Fresh", "Rotten"],
}
LABEL_WEIGHTS_BY_FRUIT = {
    "apple":  [55, 45],
    "orange": [55, 45],
    "mango":  [55, 45],
    "grapes": [55, 45],
    "banana": [55, 45],
}
GRADES = ["Grade A", "Grade B", "Grade C", "Reject"]
METHODS = ["upload", "batch", "live", "capture"]
FRUITS = ["apple", "orange", "mango", "grapes", "banana"]

# Weight distribution per label → typical confidence range
LABEL_CONF = {
    "Fresh":  (0.75, 0.99),
    "Rotten": (0.50, 0.90),
}

GRADE_THRESHOLDS = {"Grade A": 0.85, "Grade B": 0.70, "Grade C": 0.50}


def _grade(conf):
    for g, t in GRADE_THRESHOLDS.items():
        if conf >= t:
            return g
    return "Reject"


def _make_dummy_image(fruit, label, idx):
    """Create a tiny coloured image to stand in for a real photo."""
    colours = {
        ("apple", "Fresh"):      (200, 50, 50),
        ("apple", "Rotten"):     (80, 50, 30),
        ("orange", "Fresh"):     (255, 165, 0),
        ("orange", "Rotten"):    (120, 80, 30),
        ("mango", "Fresh"):      (255, 180, 30),
        ("mango", "Rotten"):     (90, 70, 30),
        ("grapes", "Fresh"):     (120, 40, 140),
        ("grapes", "Rotten"):    (70, 40, 60),
        ("banana", "Fresh"):     (255, 225, 50),
        ("banana", "Rotten"):    (100, 80, 20),
    }
    colour = colours.get((fruit, label), (128, 128, 128))
    # Add slight variation
    colour = tuple(max(0, min(255, c + random.randint(-20, 20))) for c in colour)
    img = PILImage.new("RGB", (224, 224), colour)
    buf = BytesIO()
    img.save(buf, format="JPEG", quality=70)
    buf.seek(0)
    return SimpleUploadedFile(
        f"{fruit}_{label.lower()}_{idx}.jpg",
        buf.read(),
        content_type="image/jpeg",
    )


class Command(BaseCommand):
    help = "Seed the database with 60 realistic dummy detection records"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=60, help="Number of records")
        parser.add_argument("--clear", action="store_true", help="Delete existing records first")

    def handle(self, *args, **options):
        count = options["count"]

        if options["clear"]:
            deleted, _ = DetectionRecord.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing records."))

        now = timezone.now()
        records = []

        for i in range(count):
            fruit = random.choice(FRUITS)
            labels = LABELS_BY_FRUIT[fruit]
            weights = LABEL_WEIGHTS_BY_FRUIT[fruit]
            # Weighted label distribution
            label = random.choices(labels, weights=weights, k=1)[0]
            lo, hi = LABEL_CONF[label]
            confidence = round(random.uniform(lo, hi), 4)
            grade = _grade(confidence)
            method = random.choices(METHODS, weights=[35, 20, 30, 15], k=1)[0]
            processing_time = round(random.uniform(0.08, 0.45), 4)
            # Spread over last 45 days
            ts_offset = timedelta(
                days=random.randint(0, 45),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
                seconds=random.randint(0, 59),
            )
            timestamp = now - ts_offset

            image = _make_dummy_image(fruit, label, i)

            record = DetectionRecord(
                fruit_type=fruit,
                image=image,
                predicted_label=label,
                confidence=confidence,
                grade=grade,
                detection_method=method,
                processing_time=processing_time,
            )
            record.save()
            # Override auto_now_add timestamp
            DetectionRecord.objects.filter(pk=record.pk).update(timestamp=timestamp)

            records.append(record)
            self.stdout.write(f"  [{i+1}/{count}] {fruit:6s} | {label:10s} | {confidence:.2%} | {grade:8s} | {method}")

        self.stdout.write(self.style.SUCCESS(f"\n✅ Successfully created {count} dummy records!"))
        fruits_summary = ", ".join(f"{sum(1 for r in records if r.fruit_type==f)} {f}s" for f in FRUITS)
        self.stdout.write(f"   Fruits: {fruits_summary}")
