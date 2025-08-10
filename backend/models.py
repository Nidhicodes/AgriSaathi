from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId

from typing import Any
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: Any
    ) -> core_schema.CoreSchema:
        def validate_from_str(v: str) -> ObjectId:
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid ObjectId")
            return ObjectId(v)

        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema(
                [
                    core_schema.is_instance_schema(ObjectId),
                    core_schema.chain_schema(
                        [
                            core_schema.str_schema(),
                            core_schema.no_info_plain_validator_function(
                                validate_from_str
                            ),
                        ]
                    ),
                ]
            ),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    language: str
    location: dict # {"pincode": "123456", "city": "Lucknow"}

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class Equipment(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    description: str
    owner_id: PyObjectId
    pincode: str
    price_per_day: float
    availability_status: bool = True
    image_urls: List[str] = []
    contact_name: str
    contact_phone: str
    contact_whatsapp: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class Booking(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    equipment_id: PyObjectId
    renter_id: PyObjectId
    start_date: str
    end_date: str
    total_price: float
    status: str = "pending" # pending, confirmed, completed, cancelled

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class Query(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    query_text: str
    response: str
    confidence: float
    sources: List[str]
    timestamp: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
