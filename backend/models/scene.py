from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class PanelLayout(str, Enum):
    SINGLE = "single"
    DOUBLE = "double"
    TRIPLE = "triple"
    VERTICAL_SCROLL = "vertical_scroll"

class SceneStyle(str, Enum):
    MANGA = "manga"
    MANHWA = "manhwa"
    WESTERN_COMIC = "western_comic"

class Panel(BaseModel):
    id: str
    index: int
    prompt: str
    image_url: str
    description: str
    dialogue: Optional[str] = None
    character_ids: List[str] = Field(default_factory=list)
    position: Dict[str, int] = Field(default_factory=dict)  # x, y coordinates
    size: Dict[str, int] = Field(default_factory=dict)  # width, height

class SceneCreate(BaseModel):
    prompt: str = Field(..., min_length=10, max_length=2000)
    character_ids: List[str] = Field(..., min_items=1)
    style: SceneStyle = SceneStyle.MANGA
    layout: PanelLayout = PanelLayout.DOUBLE
    previous_scene_context: Optional[str] = None
    next_scene_hint: Optional[str] = None
    user_id: str

class Scene(BaseModel):
    id: str
    prompt: str
    character_ids: List[str]
    style: SceneStyle
    layout: PanelLayout
    panels: List[Panel]
    previous_scene_context: Optional[str]
    next_scene_hint: Optional[str]
    user_id: str
    created_at: datetime
    updated_at: datetime
    story_continuity_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    class Config:
        from_attributes = True

class SceneEdit(BaseModel):
    panel_id: str
    new_dialogue: Optional[str] = None
    new_character_ids: Optional[List[str]] = None
    new_position: Optional[Dict[str, int]] = None
    new_size: Optional[Dict[str, int]] = None
