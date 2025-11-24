from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
from app.models import sql_models
from app.models.db import engine

# Create Tables
sql_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Stock Market Data Analyzer")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api")

from app.services.scheduler_service import start_scheduler

@app.on_event("startup")
def on_startup():
    start_scheduler()

@app.get("/")
def read_root():
    return {"message": "Welcome to Stock Market Data Analyzer API"}
