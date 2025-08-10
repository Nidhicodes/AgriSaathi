import json
import os
import logging
from fastapi import APIRouter, HTTPException, Query
from ..schemas import MarketResponse, MarketPrice
from ..location import get_location_details, LocationError
from typing import List

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

router = APIRouter()

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'market_prices.json')

def load_market_data_from_json() -> List[dict]:
    """Loads market data from the local JSON file."""
    try:
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
        logger.info(f"Successfully loaded {len(data)} records from {DATA_FILE}")
        return data
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Could not read or parse market data file at {DATA_FILE}: {e}")
        return []

@router.get("/market", response_model=MarketResponse)
async def get_market_prices(pincode: str = Query(..., min_length=6, max_length=6)):
    """
    Retrieves market prices from a local JSON file and filters them by state
    associated with the given pincode.
    """
    logger.info(f"GET /market called with pincode: {pincode}")

    try:
        location = get_location_details(pincode)
        user_state = location["state"]
        logger.info(f"Determined state '{user_state}' for pincode {pincode}")
    except LocationError as e:
        logger.error(f"LocationError for pincode {pincode}: {e}")
        raise HTTPException(status_code=400, detail=f"Could not determine location for pincode: {e}")

    all_market_data = load_market_data_from_json()
    if not all_market_data:
        return MarketResponse(market_data=[])
    
    adapted_market_data: List[MarketPrice] = []
    for item in all_market_data:
        price_details = MarketPrice(
            state=item.get("location", "N/A"), 
            apmc=item.get("location", "N/A"),
            commodity=item.get("crop", "N/A"),
            min_price=item.get("price", 0.0),
            modal_price=item.get("price", 0.0),
            max_price=item.get("price", 0.0),
            unit="Quintal",
            date="N/A",
        )
        adapted_market_data.append(price_details)

    logger.info(f"Returning {len(adapted_market_data)} total market entries from local JSON.")
    return MarketResponse(market_data=adapted_market_data)
