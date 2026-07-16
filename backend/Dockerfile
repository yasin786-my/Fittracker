# ── Stage: runtime ──────────────────────────────────────────────
FROM python:3.11-slim AS runtime

# System deps required by mysqlclient (C extension)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        default-libmysqlclient-dev \
        gcc \
        pkg-config && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps (cached unless requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Env defaults (overridden by docker-compose / .env.docker)
ENV FLASK_APP=run.py \
    FLASK_ENV=production

EXPOSE 5000

# Entrypoint: run migrations then start Gunicorn
COPY <<'EOF' /entrypoint.sh
#!/bin/bash
set -e

echo "⏳ Running database migrations..."
flask db upgrade 2>/dev/null || flask db init && flask db migrate -m "initial" && flask db upgrade

echo "🚀 Starting Gunicorn on port 5000..."
exec gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 "run:app"
EOF

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
