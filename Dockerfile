# Stage 1: Frontend build
FROM node:20 AS frontend
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install
RUN npm run build

# Stage 2: Final image with backend + frontend static
FROM python:3.11-slim
WORKDIR /app

# Copy backend code and requirements
COPY backend/ backend/
COPY requirements.txt .

# Install backend dependencies (including uvicorn)
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend build output to backend static folder
COPY --from=frontend /app/frontend/build /app/backend/static

# Run the backend app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
