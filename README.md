# 🏃 FitTracker — Track Smarter. Move Better.

A production-ready full-stack fitness tracking web application built with Flask + React.

---

## 📁 Project Structure

```
fittracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── models.py            # SQLAlchemy models
│   │   └── routes/
│   │       ├── auth.py          # Register, login, refresh, me
│   │       ├── dashboard.py     # Today summary, insights, onboarding
│   │       ├── workouts.py      # Start/end sessions, exercises
│   │       ├── progress.py      # Calendar, trends, PRs, streaks
│   │       └── profile.py       # View/edit profile, goals
│   ├── config.py                # Environment-based config
│   ├── run.py                   # Entry point
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js        # Axios + JWT interceptors
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Auth state + token management
    │   │   └── ThemeContext.jsx # Dark mode
    │   ├── components/
    │   │   ├── ui/
    │   │   │   ├── ProgressRing.jsx  # Animated SVG ring
    │   │   │   └── CountUp.jsx       # Count-up animation
    │   │   └── layout/
    │   │       └── BottomNav.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Onboarding.jsx    # 4-step profile setup
    │   │   ├── Dashboard.jsx     # Main screen with rings + insights
    │   │   ├── WorkoutStart.jsx  # Choose workout type
    │   │   ├── SessionActive.jsx # Live tracking + exercises
    │   │   ├── History.jsx       # Calendar, trends, PRs
    │   │   └── Profile.jsx       # Settings, goals, dark mode
    │   ├── App.jsx               # Router + protected routes
    │   ├── main.jsx
    │   └── index.css             # Tailwind + custom utilities
    ├── vite.config.js            # Proxy /api → backend:5000
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

- Python 3.11+
- Node.js 18+
- MySQL 8.0

---

## 🗄️ Database Setup

### 1. Start MySQL and create database

```sql
-- Connect as root
mysql -u root -p

-- Create database and user
CREATE DATABASE fittracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fittracker'@'localhost' IDENTIFIED BY 'fittracker_pass';
GRANT ALL PRIVILEGES ON fittracker_db.* TO 'fittracker'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🐍 Backend Setup

### 1. Navigate and create virtual environment

```bash
cd fittracker/backend
python3.11 -m venv venv
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

> **Note:** `mysqlclient` may require system packages:
> - macOS: `brew install mysql-client pkg-config`
> - Ubuntu: `sudo apt-get install python3-dev default-libmysqlclient-dev`

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your MySQL credentials and secret keys
```

`.env` file:
```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

DB_USER=fittracker
DB_PASSWORD=fittracker_pass
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fittracker_db

DATABASE_URL=mysql://fittracker:fittracker_pass@localhost:3306/fittracker_db
```

### 4. Initialize database with Flask-Migrate

```bash
# Initialize migrations (first time only)
flask db init

# Create migration
flask db migrate -m "initial schema"

# Apply migration
flask db upgrade
```

### 5. Run the backend

```bash
flask run
# or: python run.py
```

Backend runs at: **http://localhost:5000**

Health check: `curl http://localhost:5000/api/health`

---

## ⚛️ Frontend Setup

### 1. Navigate and install

```bash
cd fittracker/frontend
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

The Vite dev server proxies `/api/*` → `http://localhost:5000`, so no CORS issues.

---

## 🚀 Full Start (Quick)

```bash
# Terminal 1 — Backend
cd fittracker/backend
source venv/bin/activate
flask run

# Terminal 2 — Frontend
cd fittracker/frontend
npm run dev
```

Open: **http://localhost:5173**

---

## 🗺️ API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with name, email, password |
| POST | `/api/auth/login` | Login, returns JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/today` | Today's summary, insight, streak |
| PATCH | `/api/dashboard/today` | Update steps/sleep/calories |
| POST | `/api/dashboard/onboarding` | Save onboarding profile |

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workouts/start` | Start a workout session |
| PATCH | `/api/workouts/:id` | Update live session |
| POST | `/api/workouts/:id/end` | End session + save |
| DELETE | `/api/workouts/:id` | Cancel session |
| GET | `/api/workouts/` | List completed sessions |
| GET | `/api/workouts/:id` | Get session with exercises |
| POST | `/api/workouts/:id/exercises` | Add exercise |
| PATCH | `/api/workouts/:id/exercises/:eid` | Update sets/reps |
| DELETE | `/api/workouts/:id/exercises/:eid` | Delete exercise |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/calendar?year=&month=` | Monthly calendar data |
| GET | `/api/progress/trends?days=30` | Daily metrics for charts |
| GET | `/api/progress/strength-prs` | Personal records by exercise |
| GET | `/api/progress/streak` | Current + longest streak |
| GET | `/api/progress/day/:date` | Detailed day view |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/` | Get profile |
| PATCH | `/api/profile/` | Update profile |
| POST | `/api/profile/change-password` | Change password |

---

## 🎨 Key Features

- **Animated Progress Ring** — SVG + framer-motion fill animation on dashboard
- **Count-up Animations** — Stats count up from 0 on load
- **Live Timer** — Monospace tabular font, play/pause, elapsed time
- **Strength Tracking** — Dynamic exercise rows, sets/reps/weight, completion toggle
- **Confetti** — canvas-confetti fires on workout completion
- **Rule-based Insights** — Sleep + activity → coach message, no AI/ML
- **Calendar** — Color-coded monthly view: green (met), orange (partial), gray (missed)
- **Recharts** — Line + bar charts for trends and PRs
- **Streaks** — Consecutive days with flame animation
- **Dark Mode** — Persisted in localStorage, system preference detect
- **JWT Refresh** — Auto-refresh on 401 with request queue
- **Mobile-first** — Bottom nav, safe areas, touch-optimized

---

## 🏭 Production Deployment

### Backend (Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 "run:app"
```

### Frontend (build)
```bash
npm run build
# Serves dist/ — point Nginx at it
```

### Nginx config (example)
```nginx
server {
    listen 80;
    root /var/www/fittracker/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔒 Security Notes

- Passwords hashed with bcrypt (cost factor 12)
- JWT access tokens expire in 15 minutes
- Refresh tokens expire in 30 days
- All protected routes require `Authorization: Bearer <token>`
- CORS restricted to known origins in production
- Input validation on both frontend and backend
- SQL injection protected via SQLAlchemy ORM

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.11, Flask 3.x |
| ORM | Flask-SQLAlchemy + Flask-Migrate |
| Auth | Flask-JWT-Extended + bcrypt |
| Database | MySQL 8 (mysqlclient) |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS 3 |
| HTTP | Axios |
| Dates | date-fns |
| Animation | framer-motion + canvas-confetti |
| Charts | Recharts |
| Icons | lucide-react |
| Toasts | react-hot-toast |



---


## 📜 License
Copyright (c) 2024
This project is open-source and available under the MIT License.

---

### 📝 Note
This project was built for educational purposes to understand the "behind the scenes" of web development before moving on to more advanced frameworks.
