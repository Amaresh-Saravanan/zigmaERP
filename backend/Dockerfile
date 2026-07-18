FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBUG=False \
    ALLOWED_HOSTS=zigmaerp-1.onrender.com \
    CORS_ALLOWED_ORIGINS=https://zigma-erp-249p.vercel.app

# default-libmysqlclient-dev + build-essential + pkg-config: required to build
# mysqlclient's C extension (Django's MariaDB/MySQL DB driver) on the slim image.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential default-libmysqlclient-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
