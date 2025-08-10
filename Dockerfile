FROM python:3.11-slim AS backend
WORKDIR /app
COPY backend/ backend/
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM node:20 AS frontend
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install && npm run build

FROM python:3.11-slim
WORKDIR /app
COPY --from=backend /app /app
COPY --from=frontend /app/backend/static /app/backend/static

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
