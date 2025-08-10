from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

router = APIRouter()

class QueryRequest(BaseModel):
    query: str = Field(..., max_length=500)
    language: str = "en"
    pincode: str = Field(..., max_length=6)


@router.get("/schemes")
def get_schemes():
    return {"schemes": []}

class QueryResponse(BaseModel):
    response: str
    confidence: float
    sources: list
    weather: Optional[dict] = None
    market: Optional[dict] = None

class WeatherResponse(BaseModel):
    forecast: list 

class MarketPrice(BaseModel):
    state: str
    apmc: str
    commodity: str
    min_price: float
    max_price: float
    modal_price: float
    unit: str
    date: str

class MarketResponse(BaseModel):
    market_data: list[MarketPrice]

class SchemeResponse(BaseModel):
    schemes: list 
