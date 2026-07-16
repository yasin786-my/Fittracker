#!/bin/bash
set -e

echo "⏳ Waiting for MySQL to accept real connections..."
DB_HOST="${DB_HOST:-db}"
for i in $(seq 1 30); do
  if (exec 3<>/dev/tcp/"$DB_HOST"/3306) 2>/dev/null; then
    exec 3<&- 3>&-
    echo "✅ MySQL port is open, giving it a moment to finish init..."
    sleep 3
    break
  fi
  echo "MySQL not reachable yet, retrying ($i/30)..."
  sleep 2
done

echo "⏳ Checking migration setup..."

if [ ! -d "migrations" ]; then
  echo "No migrations/ directory found — running flask db init..."
  flask db init
fi

if [ -z "$(ls -A migrations/versions 2>/dev/null)" ]; then
  echo "No migration scripts found — generating an initial migration from current models..."
  flask db migrate -m "initial"
fi

echo "⏳ Applying migrations..."
flask db upgrade

echo "🚀 Starting Gunicorn on port 5000..."
exec gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 "run:app"