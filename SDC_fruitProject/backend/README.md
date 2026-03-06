# Django Backend - Fruit Freshness Detection (YOLOv8)

## Stack
- Django + DRF
- JWT auth (SimpleJWT)
- SQLite (dev)
- Ultralytics YOLOv8
- Pillow
- CORS + dotenv

## Classification
The model outputs two labels:
- **Fresh** — Good quality fruit
- **Rotten** — Spoiled fruit

## Project Layout
- `config/` project settings and root urls
- `apps/users/` register/login/refresh/me APIs
- `apps/detection/` detection, dashboard, history, settings, YOLO service
- `apps/detection/model_weights/` put your model file here
- `media/` uploaded images

## Setup
1. Create and activate venv
2. Install deps:
   - `pip install -r requirements.txt`
3. Copy env:
   - `copy .env.example .env` (Windows) or `cp .env.example .env`
4. Put model file in:
   - `apps/detection/model_weights/best.pt`
5. Run migrations:
   - `python manage.py migrate`
6. Create user:
   - `python manage.py createsuperuser`
7. (Optional) Seed demo data:
   - `python manage.py seed_demo`
8. Run server:
   - `python manage.py runserver`

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/detect/`
- `GET /api/dashboard/`
- `GET /api/detections/`
- `GET /api/detections/latest/`
- `GET /api/settings/`
- `POST /api/settings/`

## Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

## Notes
- Detection APIs require `Authorization: Bearer <access_token>`.
- Confidence threshold can be adjusted via `/api/settings/`.
- If no model file exists, detection returns a clear server error describing expected path.
