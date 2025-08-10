from fastapi import APIRouter, HTTPException
from ..schemas import QueryRequest, QueryResponse
from ..ai.llama_pipeline import get_ai_response
from .weather import get_weather
from .market import get_market_prices
from ..location import get_location_details, LocationError
import traceback

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    print(f"[QUERY] Received request: query='{request.query}', language='{request.language}', pincode='{request.pincode}'")

    try:
        print(f"[STEP 1] Fetching location details...")
        location_details = get_location_details(request.pincode)
        print(f"[STEP 1] Location: {location_details}")
    except LocationError as e:
        print(f"[ERROR] Location lookup failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[FATAL] Unexpected error in location lookup: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Location service failed")

    try:
        print(f"[STEP 2] Fetching weather data...")
        weather_data = await get_weather(request.pincode)
        print(f"[STEP 2] Weather data OK")
    except HTTPException:
        raise  
    except Exception as e:
        print(f"[ERROR] Weather fetch failed: {e}")
        traceback.print_exc()
        weather_data = None  

    try:
        print(f"[STEP 3] Fetching market data...")
        market_data = await get_market_prices(request.pincode)
        print(f"[STEP 3] Market data OK")
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Market fetch failed: {e}")
        traceback.print_exc()
        market_data = None

    try:
        print(f"[STEP 4] Calling AI pipeline...")
        ai_response, confidence, sources = await get_ai_response(
            query=request.query,
            lang=request.language,
            pincode=request.pincode,
            location_details=location_details,
            weather_data=weather_data,
            market_data=market_data,
        )
    except Exception as e:
        print(f"[FATAL] AI response generation failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="AI processing failed")

    response_data = QueryResponse(
        response=ai_response,
        confidence=confidence,
        sources=sources,
        weather=weather_data.dict() if weather_data else None,
        market=market_data.dict() if market_data else None,
    )
    print(f"[STEP 5] Sending response")
    return response_data
