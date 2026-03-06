# Apple Quality Detection Web Application

A full-stack web application for intelligent apple quality detection using machine learning. Built with **Django REST Framework** (backend), **React + Tailwind CSS** (frontend), and **SQLite** (database).

---

## Architecture

```
front-end react/
├── backend/                  # Django REST API
│   ├── core/                 # Django project settings, URLs, WSGI
│   ├── detection/            # Detection app (models, views, services, serializers, URLs)
│   ├── ml_model/             # Place your trained .h5 model here
│   ├── media/                # Uploaded images (auto-created)
│   ├── db.sqlite3            # SQLite database (auto-created)
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/                 # React + Vite + Tailwind
    ├── src/
    │   ├── components/       # Shared UI components (Layout, StatCard, ResultCard, etc.)
    │   ├── contexts/         # ThemeContext (dark mode), AuthContext (role system)
    │   ├── pages/            # Dashboard, Detect, LiveScan, History, Reports
    │   ├── api.js            # Axios API layer
    │   ├── App.jsx           # Router setup
    │   ├── main.jsx          # Entry point
    │   └── index.css         # Tailwind directives + custom utility classes
    ├── package.json
    ├── vite.config.js        # Dev proxy to Django backend
    ├── tailwind.config.js
    └── index.html
```

## Features

| Feature | Description |
|---|---|
| **Single Upload** | Drag-and-drop or file-select with animated result card |
| **Batch Upload** | Process up to 20 images, grid results with per-image status |
| **Live Camera** | Real-time detection via webcam with configurable interval |
| **Manual Capture** | Camera snapshot with preview modal (confirm/retake) |
| **Dashboard** | Interactive charts (pie, bar, line), stat cards, recent activity |
| **History** | Sortable, filterable, paginated data table with thumbnails |
| **Reports** | Date/category filters, summary preview, CSV export |
| **Dark Mode** | System-aware with manual toggle |
| **Role System** | Admin (full) / Inspector (scan+view) / Guest via UI switcher |
| **Grading** | Grade A (≥85%), B (≥70%), C (≥50%), Reject (<50%) |

## Quality Labels

- **Ripe** — Good quality, ready for consumption
- **Unripe** — Not yet ready
- **Overripe** — Past optimal freshness
- **Rotten** — Spoiled, not suitable

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/detect/` | Single image detection |
| POST | `/api/detect/batch/` | Batch detection (up to 20 images) |
| GET | `/api/records/` | List records (filter: label, grade, method, start_date, end_date) |
| DELETE | `/api/records/:id/` | Delete a record |
| GET | `/api/dashboard/stats/` | Dashboard aggregated statistics |
| GET | `/api/reports/summary/` | Report preview summary |
| GET | `/api/reports/export/` | CSV export with filters |

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd "front-end react/backend"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create admin user (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd "front-end react/frontend"

# Install dependencies
npm install

# Start dev server (proxies /api to Django on port 8000)
npm run dev
```

### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## ML Model

The app ships with a **simulation mode** that generates realistic predictions when no model file is found. To enable real inference:

1. Train a Keras/TensorFlow model with 4 output classes: `[Ripe, Unripe, Overripe, Rotten]`
2. Input shape: `(224, 224, 3)`, normalized `[0, 1]`
3. Save as `.h5` format
4. Place at `backend/ml_model/apple_quality_model.h5`
5. Restart the Django server

## Design Decisions

- **Service Layer Pattern**: ML inference is encapsulated in `detection/services.py`, loaded once at startup
- **Simulation Fallback**: Allows full-stack development without a trained model
- **Grading Thresholds**: Configurable in `services.py` (Grade A ≥ 85%, B ≥ 70%, C ≥ 50%)
- **Vite Proxy**: Frontend dev server proxies API calls to Django — no CORS issues in development
- **Component Architecture**: Reusable card, badge, toast, skeleton components
- **Dark Mode**: CSS class strategy via `ThemeContext` with `localStorage` persistence
- **Role System**: Client-side role switching for demo; easily extensible to JWT-based auth

## Tech Stack

- **Backend**: Django 4.2, Django REST Framework, Pillow, NumPy, TensorFlow (optional)
- **Frontend**: React 18, React Router 6, Vite 5, Tailwind CSS 3, Recharts, Lucide Icons, Axios
- **Database**: SQLite 3
