FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install dependencies first so this layer is cached across source-only changes.
COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

# SQLite (the default DATABASE_URL) writes app.db under /app/data — mount a
# volume there in production so the database survives container restarts.
# Switching DATABASE_URL to Postgres needs no code changes (see .env.example).
RUN useradd --create-home --uid 1000 appuser \
    && mkdir -p /app/data \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/')" || exit 1

# Apply migrations, then start the API. alembic.ini's sqlalchemy.url is left
# blank on purpose — app/core/config.py / alembic/env.py resolve it from
# DATABASE_URL at runtime, so this works against SQLite or Postgres alike.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
