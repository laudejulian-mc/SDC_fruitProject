from functools import lru_cache
from pathlib import Path
from typing import Any

from django.conf import settings


class DetectionServiceError(Exception):
    pass


def normalize_class_label(label: str) -> str:
    normalized = (label or "").strip().lower()

    if normalized in {"fresh", "good", "healthy", "ripe"}:
        return "Fresh"
    if normalized in {"bruise", "bruised", "defect", "damaged"}:
        return "Bruise"
    if normalized in {"scab", "apple_scab", "spot", "disease"}:
        return "Scab"
    if normalized in {"rot", "rotten", "bad", "spoiled", "reject"}:
        return "Rot"

    return "Bruise"


def normalize_condition(label: str) -> str:
    class_label = normalize_class_label(label)

    if class_label == "Fresh":
        return "Fresh"
    if class_label == "Rot":
        return "Rotten"

    return "Bruised"


def to_grade(class_label: str, confidence: float) -> str:
    if class_label == "Rot":
        return "Reject"

    if class_label == "Fresh":
        if confidence >= 0.90:
            return "A"
        if confidence >= 0.75:
            return "B"
        if confidence >= 0.60:
            return "C"
        return "Reject"

    if confidence >= 0.85:
        return "B"
    if confidence >= 0.70:
        return "C"
    return "Reject"


@lru_cache(maxsize=1)
def load_model() -> Any:
    model_path = Path(settings.MODEL_PATH)
    if not model_path.exists():
        raise DetectionServiceError(
            f"YOLO model not found at '{model_path}'. Put your model file in apps/detection/model_weights/."
        )

    try:
        from ultralytics import YOLO
        return YOLO(str(model_path))
    except Exception as exc:
        raise DetectionServiceError(f"Failed to load YOLO model: {exc}") from exc


def warmup_model():
    try:
        load_model()
    except DetectionServiceError:
        pass


def _result_from_classification(first_result):
    if getattr(first_result, "probs", None) is None:
        return None

    probs = first_result.probs
    top_index = int(probs.top1)
    top_conf = float(probs.top1conf.item())
    label = first_result.names.get(top_index, str(top_index))
    return label, top_conf


def _result_from_detection(first_result):
    boxes = getattr(first_result, "boxes", None)
    if boxes is None or len(boxes) == 0:
        return None

    best_conf = -1.0
    best_label = None

    for box in boxes:
        conf = float(box.conf.item()) if box.conf is not None else 0.0
        cls_index = int(box.cls.item()) if box.cls is not None else 0
        label = first_result.names.get(cls_index, str(cls_index))
        if conf > best_conf:
            best_conf = conf
            best_label = label

    if best_label is None:
        return None

    return best_label, best_conf


def run_inference(image_path: str, confidence_threshold: float):
    try:
        model = load_model()
        results = model.predict(
            source=image_path,
            conf=confidence_threshold,
            verbose=False,
            device="cpu",
        )
    except DetectionServiceError:
        raise
    except Exception as exc:
        raise DetectionServiceError(f"YOLO inference failure: {exc}") from exc

    if not results:
        raise DetectionServiceError("No output from model.")

    first = results[0]

    raw = _result_from_classification(first)
    if raw is None:
        raw = _result_from_detection(first)

    if raw is None:
        return None

    label, confidence = raw
    predicted_label = normalize_class_label(label)
    condition = normalize_condition(label)
    grade = to_grade(predicted_label, confidence)

    return {
        "predicted_label": predicted_label,
        "condition": condition,
        "confidence": round(confidence, 4),
        "grade": grade,
    }
