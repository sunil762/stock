SMC Predictor - Production-ready bundle

Contents:
- frontend/: React app (Vite) with upload UI, auth, history
- backend/: FastAPI backend with JWT auth, SQLite DB, image annotation and model integration
- Dockerfiles for frontend and backend
- docker-compose.yml to run both services

Quick start (Linux/Mac/Windows with Docker):
1. Unzip the package
2. Edit backend/.env or docker-compose.yml to set APP_SECRET and other env vars
3. Build and run:
   docker-compose up --build
4. Frontend: http://localhost:3000
   Backend API: http://localhost:8000

Notes:
- Place your Keras model at backend/models/model.h5 if you want real predictions.
- For production, use a secure secret, HTTPS, and S3 (or equivalent) for file storage.
- The project uses SQLite for simplicity. Migrate to Postgres for production use.
