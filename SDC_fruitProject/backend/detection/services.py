"""
Business logic and ML inference service layer.

Uses a YOLOv8 classification model (best.pt) trained on 8 classes
covering both apple and mango quality states.
The model is loaded ONCE at module import time and reused for every request.
"""
import time
import logging
import random
from pathlib import Path

import numpy as np
from PIL import Image

from django.conf import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Grading thresholds
# ---------------------------------------------------------------------------
GRADE_THRESHOLDS = {
    "Grade A": 0.85,
    "Grade B": 0.70,
    "Grade C": 0.50,
    # Below 0.50 → Reject
}

LABELS_BY_FRUIT = {
    "apple":  ["Fresh", "Rotten"],
    "orange": ["Fresh", "Rotten"],
    "mango":  ["Fresh", "Rotten"],
    "grapes": ["Fresh", "Rotten"],
    "banana": ["Fresh", "Rotten"],
}
# Flat unique list (for model choices / validation)
ALL_LABELS = ["Fresh", "Rotten"]
IMG_SIZE = 224  # YOLO classification input size

# ---------------------------------------------------------------------------
# Class-name mapping  (raw YOLO class → display label)
# ---------------------------------------------------------------------------
CLASS_DISPLAY = {
    "apple_bruise_defect":      "Rotten",
    "apple_fresh":              "Fresh",
    "apple_rot_defect":         "Rotten",
    "apple_scab_defect":        "Rotten",
    "mango_black_spot_defect":  "Rotten",
    "mango_bruise_defect":      "Rotten",
    "mango_fresh":              "Fresh",
    "mango_rot_defect":         "Rotten",
}
CLASS_FRUIT = {k: ("apple" if k.startswith("apple_") else "mango") for k in CLASS_DISPLAY}

# ---------------------------------------------------------------------------
# Model singleton  (ultralytics YOLO)
# ---------------------------------------------------------------------------
_model = None


def _load_model():
    """Load the YOLO classification model once. Falls back to simulation."""
    global _model
    model_path = Path(settings.ML_MODEL_PATH)
    if model_path.exists():
        try:
            from ultralytics import YOLO
            _model = YOLO(str(model_path))
            logger.info("YOLO model loaded from %s  (classes: %s)", model_path, _model.names)
            return
        except Exception as e:
            logger.warning("Failed to load YOLO model: %s – using simulation", e)
    else:
        logger.info(
            "YOLO model not found at %s – using simulation mode. "
            "Place best.pt there to enable real inference.",
            model_path,
        )
    _model = None  # simulation mode


# Load at import (server startup)
_load_model()


def compute_grade(confidence: float) -> str:
    """Convert confidence score to a letter grade."""
    for grade, threshold in GRADE_THRESHOLDS.items():
        if confidence >= threshold:
            return grade
    return "Reject"


def _to_pil_image(image_file) -> Image.Image:
    """
    Convert any incoming image source to a PIL RGB Image.

    Handles:
      - Django InMemoryUploadedFile / TemporaryUploadedFile
      - File-like objects (BytesIO, open file handles)
      - File path strings / Path objects
    """
    if isinstance(image_file, (str, Path)):
        img = Image.open(str(image_file))
    else:
        # Django uploaded files & generic file-like objects
        image_file.seek(0)
        img = Image.open(image_file)

    # Always convert to RGB (handles RGBA PNGs, grayscale, palette, etc.)
    return img.convert("RGB")


def predict(image_file, fruit_type="apple") -> dict:
    """
    Run YOLO classification inference on a single image.

    The model predicts one of 8 classes. We pick the highest-confidence
    class that matches the requested fruit_type.

    Returns dict: predicted_label, confidence, grade, processing_time
    """
    start = time.time()

    if _model is not None:
        # ── Real YOLO inference ───────────────────────────────
        # Convert uploaded file → PIL Image (ultralytics accepts PIL natively)
        pil_img = _to_pil_image(image_file)

        results = _model.predict(source=pil_img, imgsz=IMG_SIZE, verbose=False)
        probs = results[0].probs  # ultralytics Probs object

        # Pick highest-confidence class belonging to the requested fruit_type
        best_label = None
        best_conf = 0.0
        sorted_indices = probs.data.argsort(descending=True).tolist()

        for idx in sorted_indices:
            raw_name = _model.names[idx]
            if CLASS_FRUIT.get(raw_name) == fruit_type:
                best_conf = float(probs.data[idx])
                best_label = CLASS_DISPLAY[raw_name]
                break  # sorted desc → first match is highest

        # Fallback: use overall top-1 if no match for fruit_type
        if best_label is None:
            top_idx = int(probs.top1)
            raw_name = _model.names[top_idx]
            best_label = CLASS_DISPLAY.get(raw_name, raw_name)
            best_conf = float(probs.top1conf)

        label = best_label
        confidence = round(best_conf, 4)
    else:
        # ── Simulation mode ───────────────────────────────────
        labels = LABELS_BY_FRUIT.get(fruit_type, LABELS_BY_FRUIT["apple"])
        try:
            pil_img = _to_pil_image(image_file)
            arr = np.array(pil_img.resize((IMG_SIZE, IMG_SIZE)), dtype=np.float32) / 255.0
            seed = int(arr.mean() * 10000)
            rng = random.Random(seed)
        except Exception:
            rng = random.Random()

        label = rng.choice(labels)
        confidence = round(rng.uniform(0.55, 0.99), 4)

    grade = compute_grade(confidence)
    processing_time = round(time.time() - start, 4)

    return {
        "predicted_label": label,
        "confidence":      confidence,
        "grade":           grade,
        "processing_time": processing_time,
    }
