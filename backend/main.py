import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from starlette.responses import JSONResponse
from starlette.status import HTTP_404_NOT_FOUND

from .routes import query, market, weather, schemes, agri_share, location
from .db import client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(static_dir, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query.router, prefix="/api/query")
app.include_router(weather.router, prefix="/api/weather")
app.include_router(market.router, prefix="/api/market")
app.include_router(schemes.router, prefix="/api/schemes")
app.include_router(agri_share.router, prefix="/api/agri-share")
app.include_router(location.router, prefix="/api/location")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api") or full_path.startswith("static"):
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Not found")
    return FileResponse(os.path.join(static_dir, "index.html"))

@app.get("/")
async def root():
    return FileResponse(os.path.join(static_dir, "index.html"))

@app.on_event("startup")
def on_startup():
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)
