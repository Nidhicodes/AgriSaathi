import shutil
import uuid
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Body, Depends, UploadFile, File, Form, Request
from bson import ObjectId

from ..models import Equipment, Booking, PyObjectId
from ..db import db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/agri-share/equipment", response_model=Equipment)
async def create_equipment(
    request: Request,
    name: str = Form(...),
    description: str = Form(...),
    price_per_day: float = Form(...),
    pincode: str = Form(...),
    owner_id: str = Form(...),
    contact_name: str = Form(...),
    contact_phone: str = Form(...),
    contact_whatsapp: Optional[str] = Form(None),
    images: List[UploadFile] = File(...)
):
    """
    Create a new equipment listing with image uploads.
    """
    image_urls = []
    for image in images:
        file_extension = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"backend/static/uploads/{unique_filename}"
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
        finally:
            image.file.close()
            
        base_url = str(request.base_url).rstrip('/')
        image_url = f"{base_url}/static/uploads/{unique_filename}"
        image_urls.append(image_url)
    
    logger.info(f"Generated image URLs: {image_urls}")

    try:
        owner_obj_id = PyObjectId(owner_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid owner_id format.")

    equipment_data = {
        "name": name,
        "description": description,
        "price_per_day": price_per_day,
        "pincode": pincode,
        "owner_id": owner_obj_id,
        "contact_name": contact_name,
        "contact_phone": contact_phone,
        "contact_whatsapp": contact_whatsapp,
        "image_urls": image_urls,
        "availability_status": True,
    }
    
    try:
        equipment_model = Equipment(**equipment_data)
        equipment_to_insert = equipment_model.model_dump(by_alias=True, exclude=["id"])
        result = db.equipment.insert_one(equipment_to_insert)
    except Exception as e:
        logger.error(f"Failed to create equipment in DB: {e}")
        raise HTTPException(status_code=500, detail="Database operation failed.")
    new_equipment = db.equipment.find_one({"_id": result.inserted_id})
    
    if new_equipment:
        return Equipment(**new_equipment)
    raise HTTPException(status_code=500, detail="Failed to create equipment")


@router.get("/agri-share/equipment", response_model=List[Equipment])
async def list_equipment(pincode: str = None):
    """
    List all available equipment, optionally filtering by pincode.
    """
    query = {"availability_status": True}
    if pincode:
        query["pincode"] = pincode
    
    equipment_list = []
    for equipment in db.equipment.find(query):
        equipment_list.append(Equipment(**equipment))
    return equipment_list


@router.get("/agri-share/equipment/{equipment_id}", response_model=Equipment)
async def get_equipment(equipment_id: PyObjectId):
    """
    Get details for a specific piece of equipment.
    """
    equipment = db.equipment.find_one({"_id": equipment_id})
    if equipment:
        return Equipment(**equipment)
    raise HTTPException(status_code=404, detail="Equipment not found")


@router.post("/agri-share/bookings", response_model=Booking)
async def create_booking(booking: Booking = Body(...)):
    """
    Create a new booking request.
    """
    booking_dict = booking.model_dump(by_alias=True, exclude=["id"])
    
    equipment = db.equipment.find_one({"_id": booking.equipment_id, "availability_status": True})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not available for booking")
        
    result = db.bookings.insert_one(booking_dict)
    new_booking = db.bookings.find_one({"_id": result.inserted_id})
    
    if new_booking:
        return Booking(**new_booking)
    raise HTTPException(status_code=500, detail="Failed to create booking")


@router.get("/agri-share/bookings", response_model=List[Booking])
async def get_user_bookings(user_id: PyObjectId):
    """
    Get all bookings for a specific user (both as owner and renter).
    This is a simplified implementation. A real app would get the user_id from auth.
    """
    owned_equipment_ids = [e["_id"] for e in db.equipment.find({"owner_id": user_id}, {"_id": 1})]
    
    bookings = []
    for booking in db.bookings.find({
        "$or": [
            {"renter_id": user_id},
            {"equipment_id": {"$in": owned_equipment_ids}}
        ]
    }):
        bookings.append(Booking(**booking))
        
    return bookings
