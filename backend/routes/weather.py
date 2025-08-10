import os
import requests
import logging
import time
from fastapi import APIRouter, HTTPException, Query
from ..schemas import WeatherResponse
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter()
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
CACHE_EXPIRY = 1800  
weather_cache = {}

@router.get("/weather", response_model=WeatherResponse)
async def get_weather(pincode: str = Query(..., min_length=6, max_length=6)):
    logger.info(f"Received request for weather data with pincode: {pincode}")

    if pincode in weather_cache:
        cached_data, timestamp = weather_cache[pincode]
        if time.time() - timestamp < CACHE_EXPIRY:
            logger.info(f"[CACHE] HIT: Weather for pincode {pincode}")
            return cached_data

    if not WEATHER_API_KEY:
        logger.error("Weather API key not found in environment variables.")
        raise HTTPException(status_code=500, detail="Weather API key not configured")

    # API URL
    url = f"http://api.weatherapi.com/v1/forecast.json?key={WEATHER_API_KEY}&q=India {pincode}&days=7&aqi=no&alerts=no"
    logger.debug(f"Constructed Weather API URL: {url}")

    try:
        logger.info(f"[CACHE] MISS: Fetching weather for pincode {pincode}")
        response = requests.get(url)
        logger.info(f"WeatherAPI responded with status code: {response.status_code}")

        response.raise_for_status()
        data = response.json()

        logger.debug(f"Full API Response: {data}")

        forecast_days = data.get("forecast", {}).get("forecastday", [])
        logger.info(f"Extracted forecast for {len(forecast_days)} days.")

        weather_data = WeatherResponse(forecast=forecast_days)
        
        # Store in cache
        weather_cache[pincode] = (weather_data, time.time())

        return weather_data

    except requests.exceptions.RequestException as e:
        logger.exception("Error while fetching data from WeatherAPI.")
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {e}")

    except Exception as e:
        logger.exception("Unexpected error occurred.")
        raise HTTPException(status_code=500, detail=str(e))
