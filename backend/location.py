import requests
from typing import Optional, Dict, Any

API_URL = "https://api.postalpincode.in/pincode/{pincode}"

class LocationError(Exception):
    """Custom exception for location service errors."""
    pass

def get_location_details(pincode: str) -> Optional[Dict[str, Any]]:
    """
    Fetches location details (district, state) for a given Indian pincode.
    """
    if not pincode or not pincode.isdigit() or len(pincode) != 6:
        raise LocationError(f"Invalid pincode format: {pincode}")

    url = API_URL.format(pincode=pincode)
    
    try:
        response = requests.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json",
            },
            timeout=5  
        )
        response.raise_for_status()

        data = response.json()

        if not data or not isinstance(data, list) or data[0].get("Status") != "Success":
            error_message = data[0].get("Message", "No records found")
            raise LocationError(f"Could not find location for pincode {pincode}. Reason: {error_message}")

        post_office_info = data[0].get("PostOffice")
        if not post_office_info:
            raise LocationError(f"No PostOffice data found for pincode {pincode}")

        first_post_office = post_office_info[0]
        district = first_post_office.get("District")
        state = first_post_office.get("State")

        if not district or not state:
            raise LocationError(f"District or State not found in API response for pincode {pincode}")

        return {"district": district, "state": state}

    except requests.exceptions.RequestException as e:
        raise LocationError(f"API request failed for pincode {pincode}: {e}")
    except (ValueError, IndexError) as e:
        raise LocationError(f"Failed to parse API response for pincode {pincode}: {e}")
