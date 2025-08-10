from fastapi import APIRouter, HTTPException
from ..location import get_location_details, LocationError

router = APIRouter()

@router.get("/location/{pincode}")
def validate_pincode(pincode: str):
    """
    Validates a pincode and returns its location details.
    """
    try:
        location_details = get_location_details(pincode)
        return location_details
    except LocationError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
