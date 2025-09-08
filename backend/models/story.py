from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ExportFormat(str, Enum):
    PDF = "pdf"
    WEBTOON = "webtoon"
    INSTAGRAM_CAROUSEL = "instagram_carousel"

class Page(BaseModel):
    id: str
    chapter_id: str
    scene_id: str
    page_number: int
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class Chapter(BaseModel):
    id: str
    story_id: str
    title: str
    description: Optional[str] = None
    pages: List[Page] = Field(default_factory=list)
    chapter_number: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Story(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    chapters: List[Chapter] = Field(default_factory=list)
    user_id: str
    style: str = "manga"  # Default style for the entire story
    created_at: datetime
    updated_at: datetime
    total_pages: int = 0
    
    class Config:
        from_attributes = True

class StoryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    style: str = "manga"
    user_id: str

class ChapterCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    story_id: str

class ExportRequest(BaseModel):
    story_id: str
    format: ExportFormat
    include_metadata: bool = True
    quality: str = "high"  # high, medium, low
