from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

from services.character_service import CharacterService
from services.scene_generator import SceneGenerator
from services.story_service import StoryService
from services.gemini_api import GeminiAPIService
from services.sequential_comic_generator import SequentialComicGenerator
from services.api_optimizer import APIOptimizer
from services.professional_comic_generator import ProfessionalComicGenerator
from optimizations.hackathon_optimizations import hackathon_optimizer
from models.character import Character, CharacterCreate
from models.scene import Scene, SceneCreate, Panel
from models.story import Story, Chapter, Page
from models.comic import ComicGeneration, ComicGenerationCreate, ComicMetrics
from routers.gemini_25_router import router as gemini_25_router

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="OtakuCanvas API - Nano Banana Hackathon",
    description="AI-powered Manga/Comic Creator with Gemini 2.5 Flash Image Preview",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for generated images
app.mount("/generated_images", StaticFiles(directory="generated_images"), name="generated_images")

# Initialize services
character_service = CharacterService()
scene_generator = SceneGenerator()
story_service = StoryService()
gemini_api = GeminiAPIService()
sequential_comic_generator = SequentialComicGenerator()
api_optimizer = APIOptimizer()
professional_comic_generator = ProfessionalComicGenerator()

# Include Gemini 2.5 router for hackathon features
app.include_router(gemini_25_router)

# Development logging
def log_development(action: str, details: str):
    """Log development activities to DEVELOPMENT_LOG.md"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"\n[{timestamp}] {action}: {details}\n"
    
    try:
        with open("DEVELOPMENT_LOG.md", "a", encoding="utf-8") as f:
            f.write(log_entry)
    except Exception as e:
        logger.error(f"Failed to write to development log: {e}")

# API Routes

@app.get("/")
async def root():
    return {
        "message": "OtakuCanvas API - Nano Banana Hackathon Ready!", 
        "status": "healthy", 
        "version": "2.0.0",
        "features": [
            "Gemini 2.5 Flash Image Preview",
            "Character DNA System",
            "Conversational Image Editing",
            "Hackathon Optimized"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Character Management
@app.post("/characters/", response_model=Character)
async def create_character(character: CharacterCreate):
    """Create a new character"""
    try:
        new_character = await character_service.create_character(character)
        log_development("CHARACTER_CREATED", f"Character '{character.name}' created successfully")
        return new_character
    except Exception as e:
        logger.error(f"Error creating character: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/characters/", response_model=List[Character])
async def get_characters():
    """Get all characters for the current user"""
    try:
        characters = await character_service.get_user_characters("default_user")
        return characters
    except Exception as e:
        logger.error(f"Error fetching characters: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/characters/{character_id}", response_model=Character)
async def get_character(character_id: str):
    """Get a specific character by ID"""
    try:
        character = await character_service.get_character(character_id)
        if not character:
            raise HTTPException(status_code=404, detail="Character not found")
        return character
    except Exception as e:
        logger.error(f"Error fetching character {character_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/characters/{character_id}", response_model=Character)
async def update_character(character_id: str, character: CharacterCreate):
    """Update a character"""
    try:
        updated_character = await character_service.update_character(character_id, character)
        log_development("CHARACTER_UPDATED", f"Character '{character_id}' updated successfully")
        return updated_character
    except Exception as e:
        logger.error(f"Error updating character {character_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/characters/{character_id}")
async def delete_character(character_id: str):
    """Delete a character"""
    try:
        await character_service.delete_character(character_id)
        log_development("CHARACTER_DELETED", f"Character '{character_id}' deleted successfully")
        return {"message": "Character deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting character {character_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Scene Generation
@app.post("/scenes/generate", response_model=Scene)
async def generate_scene(scene_data: SceneCreate):
    """Generate a new manga/comic scene"""
    try:
        scene = await scene_generator.generate_scene(scene_data)
        log_development("SCENE_GENERATED", f"Scene generated with {len(scene.panels)} panels")
        return scene
    except Exception as e:
        logger.error(f"Error generating scene: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scenes/{scene_id}/regenerate-panel")
async def regenerate_panel(scene_id: str, panel_index: int, new_prompt: str):
    """Regenerate a specific panel in a scene"""
    try:
        updated_scene = await scene_generator.regenerate_panel(scene_id, panel_index, new_prompt)
        log_development("PANEL_REGENERATED", f"Panel {panel_index} regenerated for scene {scene_id}")
        return updated_scene
    except Exception as e:
        logger.error(f"Error regenerating panel: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Story Management
@app.post("/stories/", response_model=Story)
async def create_story(title: str, description: str = ""):
    """Create a new story"""
    try:
        story = await story_service.create_story(title, description)
        log_development("STORY_CREATED", f"Story '{title}' created successfully")
        return story
    except Exception as e:
        logger.error(f"Error creating story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stories/", response_model=List[Story])
async def get_stories():
    """Get all stories for the current user"""
    try:
        stories = await story_service.get_user_stories()
        return stories
    except Exception as e:
        logger.error(f"Error fetching stories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stories/{story_id}/chapters/", response_model=Chapter)
async def create_chapter(story_id: str, title: str, description: str = ""):
    """Create a new chapter in a story"""
    try:
        chapter = await story_service.create_chapter(story_id, title, description)
        log_development("CHAPTER_CREATED", f"Chapter '{title}' created in story {story_id}")
        return chapter
    except Exception as e:
        logger.error(f"Error creating chapter: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chapters/{chapter_id}/pages/", response_model=Page)
async def add_page_to_chapter(chapter_id: str, scene_id: str):
    """Add a scene as a page to a chapter"""
    try:
        page = await story_service.add_page_to_chapter(chapter_id, scene_id)
        log_development("PAGE_ADDED", f"Page added to chapter {chapter_id}")
        return page
    except Exception as e:
        logger.error(f"Error adding page to chapter: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Export functionality
@app.post("/export/story/{story_id}")
async def export_story(story_id: str, format: str = "pdf"):
    """Export a story in various formats"""
    try:
        export_url = await story_service.export_story(story_id, format)
        log_development("STORY_EXPORTED", f"Story {story_id} exported as {format}")
        return {"export_url": export_url}
    except Exception as e:
        logger.error(f"Error exporting story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Hackathon-specific endpoints
@app.get("/hackathon/performance")
async def get_performance_metrics():
    """Get performance metrics for hackathon demo"""
    try:
        metrics = hackathon_optimizer.get_performance_summary()
        return {
            "status": "success",
            "metrics": metrics,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/hackathon/demo-scenarios")
async def get_demo_scenarios():
    """Get pre-defined demo scenarios for hackathon presentation"""
    try:
        scenarios = hackathon_optimizer.get_demo_scenarios()
        return {
            "status": "success",
            "scenarios": scenarios,
            "total_scenarios": len(scenarios)
        }
    except Exception as e:
        logger.error(f"Error getting demo scenarios: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/hackathon/demo-script")
async def get_demo_script():
    """Get demo script for hackathon presentation"""
    try:
        script = hackathon_optimizer.generate_demo_script()
        return {
            "status": "success",
            "script": script,
            "presentation_time": "5 minutes"
        }
    except Exception as e:
        logger.error(f"Error getting demo script: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Gemini-specific endpoints
@app.post("/ai/story-suggestions")
async def generate_story_suggestions(current_scene: str, characters: List[str]):
    """Generate story continuation suggestions using Gemini"""
    try:
        suggestions = await gemini_api.generate_story_suggestions(current_scene, characters)
        log_development("STORY_SUGGESTIONS_GENERATED", f"Generated {len(suggestions)} story suggestions")
        return {
            "status": "success",
            "suggestions": suggestions,
            "count": len(suggestions)
        }
    except Exception as e:
        logger.error(f"Error generating story suggestions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/enhance-character")
async def enhance_character_description(description: str, style: str = "manga"):
    """Enhance character description using Gemini"""
    try:
        enhanced = await gemini_api.enhance_character_description(description, style)
        log_development("CHARACTER_ENHANCED", f"Enhanced character description for {style} style")
        return {
            "status": "success",
            "original": description,
            "enhanced": enhanced,
            "style": style
        }
    except Exception as e:
        logger.error(f"Error enhancing character description: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Comic Generation Endpoints
@app.post("/comic/generate")
async def generate_comic(
    story: str = Form(...), 
    character_reference: Optional[UploadFile] = File(None),
    request: Request = None
):
    """Generate a 4-panel comic from story input"""
    try:
        # Check for demo mode header
        demo_mode = request.headers.get('X-Demo-Mode', 'false').lower() == 'true'
        
        character_ref_url = None
        if character_reference:
            # Handle character reference upload
            character_ref_url = f"/uploads/{character_reference.filename}"
            # In production, save file to storage
        
        if demo_mode:
            # Use demo service for reliable demo experience
            result = api_optimizer.demo_service.get_demo_comic_by_story(story)
            log_development("DEMO_COMIC_GENERATED", f"Generated demo comic with {len(result.get('panels', []))} panels")
        else:
            # Use professional comic generator for high-quality results
            result = await professional_comic_generator.generate_comic_from_story(story, character_ref_url)
            log_development("PROFESSIONAL_COMIC_GENERATED", f"Generated professional comic with {len(result.get('panels', []))} panels, consistency score: {result.get('character_consistency_score', 0)}")
        
        return result
    except Exception as e:
        logger.error(f"Error generating comic: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/comic/metrics")
async def get_comic_metrics():
    """Get performance metrics for comic generation"""
    try:
        usage_stats = api_optimizer.get_usage_stats()
        metrics = ComicMetrics(
            total_generations=usage_stats.get("current_usage", 0) // 4,  # 4 panels per comic
            average_time=8.5,  # Placeholder
            success_rate=95.0,  # Placeholder
            api_usage=usage_stats.get("current_usage", 0),
            total_panels_generated=usage_stats.get("current_usage", 0),
            last_generation_time=7.2,  # Placeholder
            cached_results=usage_stats.get("cached_results", 0)
        )
        return {"metrics": metrics.dict()}
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/comic/demo-stories")
async def get_demo_stories():
    """Get pre-defined demo stories for instant generation"""
    try:
        demo_stories = [
            {
                "title": "The Magic Portal Dream",
                "category": "fantasy",
                "story": "I dreamed I found a hidden portal in my backyard that led to a magical world where cats rule everything and I became their chosen human ambassador.",
                "preview": "A whimsical adventure about discovering a magical cat kingdom"
            },
            {
                "title": "Grandmother's Recipe",
                "category": "emotional", 
                "story": "The day my grandmother taught me to make her secret chocolate chip cookies, her wrinkled hands guiding mine as we mixed love into every ingredient, not knowing it would be our last time baking together.",
                "preview": "A heartwarming memory about family traditions"
            },
            {
                "title": "Superhero Hamster",
                "category": "adventure",
                "story": "My pet hamster Mr. Nibbles discovered he had superpowers and had to save our neighborhood from an invasion of robot vacuum cleaners that had gained sentience.",
                "preview": "An epic tale of tiny heroism"
            }
        ]
        return {"stories": demo_stories}
    except Exception as e:
        logger.error(f"Error getting demo stories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)