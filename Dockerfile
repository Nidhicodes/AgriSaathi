# Stage 1: Backend build
FROM python:3.11-slim AS backend
WORKDIR /app
COPY backend/ backend/
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Frontend build
FROM node:20 AS frontend
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install

# Run build and list output folder for debugging
RUN npm run build
RUN ls -la /app/frontend
RUN ls -la /app/frontend/build

# Stage 3: Final image
FROM python:3.11-slim
WORKDIR /app

COPY --from=backend /app /app
COPY --from=frontend /app/frontend/build /app/backend/static

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
