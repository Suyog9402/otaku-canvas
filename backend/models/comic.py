from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class Panel(BaseModel):
    panel_number: int
    image_url: str
    scene_description: str
    dialogue: str
    prompt_used: str

class ComicGenerationCreate(BaseModel):
    story: str = Field(..., min_length=10, max_length=2000)
    character_reference_url: Optional[str] = None
    style: str = Field(default="manga")

class ComicGeneration(BaseModel):
    id: str
    story: str
    character_reference_url: Optional[str]
    generated_panels: List[Panel]
    style: str
    created_at: datetime
    generation_time_seconds: Optional[int]
    api_calls_used: int = 0
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class DemoStory(BaseModel):
    id: str
    title: str
    story_text: str
    category: str
    sample_panels: Optional[List[Panel]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ComicMetrics(BaseModel):
    total_generations: int
    average_time: float
    success_rate: float
    api_usage: int
    total_panels_generated: int
    last_generation_time: float
    cached_results: int
