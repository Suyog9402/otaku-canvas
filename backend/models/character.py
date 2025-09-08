from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class CharacterArchetype(str, Enum):
    HERO = "hero"
    VILLAIN = "villain"
    SUPPORTING = "supporting"
    COMEDIC = "comedic"
    MYSTERIOUS = "mysterious"
    ROMANTIC = "romantic"

class CharacterStyle(str, Enum):
    MANGA = "manga"
    MANHWA = "manhwa"
    WESTERN_COMIC = "western_comic"

class CharacterCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    archetype: CharacterArchetype
    style: CharacterStyle = CharacterStyle.MANGA
    traits: List[str] = Field(default_factory=list)
    appearance: Dict[str, Any] = Field(default_factory=dict)
    personality: Dict[str, Any] = Field(default_factory=dict)
    backstory: Optional[str] = None
    image_url: Optional[str] = None
    user_id: str

class Character(CharacterCreate):
    id: str
    created_at: datetime
    updated_at: datetime
    prompt_anchor: str  # The core prompt used for AI generation
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CharacterRoster(BaseModel):
    user_id: str
    characters: List[Character]
    total_count: int
    created_at: datetime
    updated_at: datetime
