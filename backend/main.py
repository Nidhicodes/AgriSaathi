import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .routes import query, market, weather, schemes, agri_share, location
from .db import client
from dotenv import load_dotenv
from fastapi.responses import FileResponse
load_dotenv()

app = FastAPI()

static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(static_dir, "uploads"), exist_ok=True) 
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api") or full_path.startswith("static"):
        return {"detail": "Not found"}, 404
    return FileResponse(os.path.join(static_dir, "index.html"))

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)

app.include_router(query.router)
app.include_router(weather.router)
app.include_router(market.router)
app.include_router(schemes.router)
app.include_router(agri_share.router)
app.include_router(location.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AgriSaathi API"}