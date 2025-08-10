import json
import logging
from fastapi import APIRouter, HTTPException
from backend.schemas import SchemeResponse
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data')

def load_schemes_data():
    """Loads the schemes data from the JSON file."""
    filepath = os.path.join(DATA_DIR, 'schemes.json')
    logger.info(f"Loading schemes data from: {filepath}")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            logger.info(f"Loaded {len(data)} schemes from file.")
            return data
    except FileNotFoundError:
        logger.error(f"File not found: {filepath}")
        return []  
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error in {filepath}: {e}")
        return []  
    
@router.get("/schemes", response_model=SchemeResponse)
async def get_all_schemes():
    """
    Returns a list of all government schemes from the data file.
    """
    logger.info("GET /schemes endpoint called.")
    schemes_data = load_schemes_data()

    if not schemes_data:
        logger.warning("No schemes data found.")
        raise HTTPException(status_code=404, detail="No schemes data found.")
    
    logger.info(f"Returning {len(schemes_data)} schemes.")
    return SchemeResponse(schemes=schemes_data)
