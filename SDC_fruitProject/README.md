# Fruit Freshness Detection Web Application

A full-stack web application for intelligent fruit freshness detection using machine learning. Built with **Django REST Framework** (backend), **React + Tailwind CSS** (frontend), **React Native / Expo** (mobile), and **SQLite** (database).

---

## Architecture

```
SDC_fruitProject/
├── backend/                  # Django REST API
│   ├── config/               # Django project settings, URLs, WSGI
│   ├── detection/            # Detection app (models, views, services, serializers, URLs)
│   ├── apps/                 # Alternate app layout (users, detection)
│   ├── media/                # Uploaded images (auto-created)
│   ├── db.sqlite3            # SQLite database (auto-created)
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                 # React + Vite + Tailwind (web)
│   ├── src/
│   │   ├── components/       # Shared UI components (Layout, StatCard, ResultCard, etc.)
│   │   ├── contexts/         # ThemeContext (dark mode), AuthContext, I18nContext
│   │   ├── pages/            # Dashboard, Detect, LiveScan, History, Reports, Chatbot
│   │   ├── api.js            # Axios API layer
│   │   ├── App.jsx           # Router setup
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Tailwind directives + custom utility classes
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── mobile/                   # React + Vite mobile PWA
│
└── mobile-rn/                # React Native + Expo mobile app
    ├── src/
    │   ├── screens/          # All app screens
    │   ├── components/       # Shared RN components
    │   ├── contexts/         # Auth, I18n, Theme
    │   ├── i18n/             # EN, VI, FIL translations
    │   └── utils/            # Fruit constants, chatbot fallbacks
    ├── package.json
    └── app.json
```

## Features

| Feature | Description |
|---|---|
| **Single Upload** | Drag-and-drop or file-select with animated result card |
| **Batch Upload** | Process multiple images with per-image progress and status |
| **Live Camera** | Real-time detection via webcam/phone camera |
| **Manual Capture** | Camera snapshot with preview modal (confirm/retake) |
| **Dashboard** | Interactive charts, stat cards, recent activity, live clock |
| **History** | Sortable, filterable, paginated data table with thumbnails |
| **Reports** | Date/category filters, summary preview, CSV export |
| **Dark Mode** | System-aware with manual toggle |
| **Multilingual** | English, Vietnamese, Filipino |
| **AI Insights** | Rich tips on results based on fruit type and confidence |

## Classification Labels

The model classifies fruit into two categories:

- **Fresh** — Good quality, safe for consumption
- **Rotten** — Spoiled, not suitable for consumption

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

The backend uses a **YOLOv8** model trained to detect fruit freshness (Fresh vs Rotten) across multiple fruit types (apple, banana, orange, mango, grape).

1. Train a YOLOv8 model with 2 output classes: `[Fresh, Rotten]`
2. Save as `.pt` format
3. Place at `backend/detection/model_weights/best.pt`
4. Restart the Django server

## Design Decisions

- **Service Layer Pattern**: ML inference is encapsulated in `detection/services.py`, loaded once at startup
- **Simulation Fallback**: Allows full-stack development without a trained model
- **Vite Proxy**: Frontend dev server proxies API calls to Django — no CORS issues in development
- **Component Architecture**: Reusable card, badge, toast, skeleton components
- **Dark Mode**: CSS class strategy with `localStorage` / `AsyncStorage` persistence
- **Token Auth**: JWT-based auth for API access across web and mobile

## Tech Stack

- **Backend**: Django 4.2, Django REST Framework, Pillow, Ultralytics YOLOv8
- **Frontend (Web)**: React 18, React Router 6, Vite 5, Tailwind CSS 3, Recharts, Lucide Icons, Axios
- **Frontend (Mobile)**: React Native, Expo ~52, React Navigation 6, Ionicons
- **Database**: SQLite 3
