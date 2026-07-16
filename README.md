<p align="center">
  <img src="https://img.shields.io/badge/FitTracker-Track_Smarter_Move_Better-00ff88?style=for-the-badge&logo=fitness&logoColor=white" alt="FitTracker" />
</p>

<h1 align="center">🏃 FitTracker — Track Smarter. Move Better.</h1>

<p align="center">
  <strong>A production-ready full-stack fitness tracking web application built with Flask + React.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Flask-3.x-000000?style=flat-square&logo=flask" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
</p>

---

## 📁 Project Structure
```
fittracker/
├── docker-compose.yml
├── .env.docker
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── dashboard.py
│   │       ├── workouts.py
│   │       ├── progress.py
│   │       └── profile.py
│   ├── config.py
│   ├── run.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── src/
    │   ├── api/
    │   ├── context/
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Prerequisites
- **Python** 3.11+
- **Node.js** 18+
- **MySQL** 8.0
- **Docker** & **Docker Compose** (for containerized setup)

---

## 🐳 Docker Setup (Recommended)

The fastest way to get FitTracker running — no need to install Python, Node.js, or MySQL locally.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### Quick Start
```bash
# Clone the repo
git clone https://github.com/your-username/fittracker.git
cd fittracker

# Start all services (MySQL + Backend + Frontend)
docker compose up --build
```

Once all containers are healthy:
- 🌐 **Frontend:** [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- 🗄️ **MySQL:** `localhost:3306`

> The backend automatically runs database migrations on first startup.

### Useful Commands
```bash
# Start in detached mode (background)
docker compose up -d --build

# View logs
docker compose logs -f              # all services
docker compose logs -f backend      # backend only

# Stop all services
docker compose down

# Stop and remove all data (reset database)
docker compose down -v

# Rebuild a single service
docker compose build backend
docker compose up -d backend
```

### Configuration
Edit `.env.docker` to customize credentials and settings:
```bash
# Copy the template and edit
cp .env.docker .env.docker.local
# Then update docker-compose.yml env_file to point to .env.docker.local
```

> **Important:** Change `SECRET_KEY`, `JWT_SECRET_KEY`, and `MYSQL_ROOT_PASSWORD` before deploying to production.

---
## 🔧 Manual Setup
### ⚙️ Prerequisites
- **Python** 3.11+
- **Node.js** 18+
- **MySQL** 8.0
## 🗄️ Database Setup

### Create Database
```sql
mysql -u root -p

CREATE DATABASE fittracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fittracker'@'localhost' IDENTIFIED BY 'fittracker_pass';
GRANT ALL PRIVILEGES ON fittracker_db.* TO 'fittracker'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🐍 Backend Setup

```bash
cd fittracker/backend

# Create virtual environment
python3.11 -m venv venv

# Activate environment
# macOS/Linux
source venv/bin/activate
# Windows
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials
```

### Run Database Migrations
```bash
flask db init          # (First time only)
flask db migrate -m "initial schema"
flask db upgrade
```

### Start Backend
```bash
flask run
# or
python run.py
```
> Backend running at **http://localhost:5000**

---

## ⚛️ Frontend Setup

```bash
cd fittracker/frontend
npm install
npm run dev
```
> Frontend running at **http://localhost:5173**

---

## 🚀 Quick Start (Both Services)

```bash
# Terminal 1 - Backend
cd fittracker/backend
source venv/bin/activate
flask run

# Terminal 2 - Frontend
cd fittracker/frontend
npm run dev
```

Open browser → **http://localhost:5173**

---

## 🎨 Key Features
- Animated Progress Rings with SVG
- Live workout timer with pause/resume
- Strength training tracker (sets, reps, weight)
- Personal Records (PRs) tracking
- Streak counter with flame animation
- Monthly calendar with color coding
- Recharts for trends and progress visualization
- Onboarding flow (4 steps)
- Dark Mode support
- Confetti celebration on workout completion
- Fully responsive + mobile-first (Bottom Navigation)

---

## 🗺️ API Reference

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Dashboard
- `GET /api/dashboard/today`
- `PATCH /api/dashboard/today`
- `POST /api/dashboard/onboarding`

### Workouts
- `POST /api/workouts/start`
- `PATCH /api/workouts/:id`
- `POST /api/workouts/:id/end`
- `GET /api/workouts/`
- `POST /api/workouts/:id/exercises`

### Progress
- `GET /api/progress/calendar`
- `GET /api/progress/trends`
- `GET /api/progress/strength-prs`
- `GET /api/progress/streak`

### Profile
- `GET /api/profile/`
- `PATCH /api/profile/`

---

## 📦 Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Backend     | Python 3.11, Flask 3.x                  |
| ORM         | Flask-SQLAlchemy + Flask-Migrate        |
| Database    | MySQL 8                                 |
| Auth        | Flask-JWT-Extended + bcrypt             |
| Frontend    | React 18 + Vite                         |
| Styling     | Tailwind CSS                            |
| Charts      | Recharts                                |
| Animation   | framer-motion + canvas-confetti         |
| HTTP Client | Axios + JWT interceptors                |

---

## 🏭 Production Deployment

### With Docker (Recommended)
```bash
# Update .env.docker with production secrets, then:
docker compose up -d --build
```
The Docker setup already uses Gunicorn for the backend and Nginx for the frontend.

### Without Docker
- Backend: **Gunicorn**
- Frontend: `npm run build` → Serve `dist/` folder
- Recommended: **Nginx** as reverse proxy

---

## 🔒 Security
- Passwords hashed with bcrypt
- JWT Access (15 min) + Refresh (30 days) tokens
- Protected routes with proper authorization
- Input validation & SQL injection protection

---

## 📜 License
This project is licensed under the **MIT License**.

---

<p align="center">
  Built with ❤️ for fitness enthusiasts<br/>
  <sub>Track Smarter. Move Better.</sub>
</p>
