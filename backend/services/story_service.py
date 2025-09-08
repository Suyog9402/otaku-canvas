import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
import logging
import os
from supabase import create_client, Client
from dotenv import load_dotenv

from models.story import Story, Chapter, Page, StoryCreate, ChapterCreate, ExportFormat

load_dotenv()

logger = logging.getLogger(__name__)

class StoryService:
    def __init__(self):
        self.supabase: Client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_ANON_KEY")
        )
    
    async def create_story(self, title: str, description: str = "", user_id: str = "default_user") -> Story:
        """Create a new story"""
        try:
            story_id = str(uuid.uuid4())
            
            story = Story(
                id=story_id,
                title=title,
                description=description,
                chapters=[],
                user_id=user_id,
                style="manga",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                total_pages=0
            )
            
            # Store in Supabase
            result = self.supabase.table("stories").insert(story.dict()).execute()
            
            if result.data:
                logger.info(f"Story {story_id} created successfully")
                return story
            else:
                raise Exception("Failed to create story in database")
                
        except Exception as e:
            logger.error(f"Error creating story: {e}")
            raise e
    
    async def get_story(self, story_id: str) -> Optional[Story]:
        """Get a story by ID"""
        try:
            result = self.supabase.table("stories").select("*").eq("id", story_id).execute()
            
            if result.data:
                story_data = result.data[0]
                
                # Get chapters for this story
                chapters_result = self.supabase.table("chapters").select("*").eq("story_id", story_id).order("chapter_number").execute()
                chapters = []
                
                if chapters_result.data:
                    for chapter_data in chapters_result.data:
                        # Get pages for this chapter
                        pages_result = self.supabase.table("pages").select("*").eq("chapter_id", chapter_data["id"]).order("page_number").execute()
                        pages = []
                        
                        if pages_result.data:
                            for page_data in pages_result.data:
                                pages.append(Page(**page_data))
                        
                        chapter = Chapter(**chapter_data, pages=pages)
                        chapters.append(chapter)
                
                story = Story(**story_data, chapters=chapters)
                return story
            return None
            
        except Exception as e:
            logger.error(f"Error fetching story {story_id}: {e}")
            raise e
    
    async def get_user_stories(self, user_id: str = "default_user") -> List[Story]:
        """Get all stories for a user"""
        try:
            result = self.supabase.table("stories").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            
            stories = []
            if result.data:
                for story_data in result.data:
                    story = Story(**story_data)
                    stories.append(story)
            
            return stories
            
        except Exception as e:
            logger.error(f"Error fetching user stories: {e}")
            raise e
    
    async def create_chapter(self, story_id: str, title: str, description: str = "") -> Chapter:
        """Create a new chapter in a story"""
        try:
            # Get the story to determine chapter number
            story = await self.get_story(story_id)
            if not story:
                raise Exception("Story not found")
            
            chapter_id = str(uuid.uuid4())
            chapter_number = len(story.chapters) + 1
            
            chapter = Chapter(
                id=chapter_id,
                story_id=story_id,
                title=title,
                description=description,
                pages=[],
                chapter_number=chapter_number,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Store in Supabase
            result = self.supabase.table("chapters").insert(chapter.dict()).execute()
            
            if result.data:
                logger.info(f"Chapter {chapter_id} created successfully")
                return chapter
            else:
                raise Exception("Failed to create chapter in database")
                
        except Exception as e:
            logger.error(f"Error creating chapter: {e}")
            raise e
    
    async def add_page_to_chapter(self, chapter_id: str, scene_id: str) -> Page:
        """Add a scene as a page to a chapter"""
        try:
            # Get chapter to determine page number
            chapter_result = self.supabase.table("chapters").select("*").eq("id", chapter_id).execute()
            if not chapter_result.data:
                raise Exception("Chapter not found")
            
            # Get existing pages count
            pages_result = self.supabase.table("pages").select("*").eq("chapter_id", chapter_id).execute()
            page_number = len(pages_result.data) + 1 if pages_result.data else 1
            
            page_id = str(uuid.uuid4())
            
            page = Page(
                id=page_id,
                chapter_id=chapter_id,
                scene_id=scene_id,
                page_number=page_number,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Store in Supabase
            result = self.supabase.table("pages").insert(page.dict()).execute()
            
            if result.data:
                # Update story total pages count
                story_id = chapter_result.data[0]["story_id"]
                await self._update_story_page_count(story_id)
                
                logger.info(f"Page {page_id} added to chapter {chapter_id}")
                return page
            else:
                raise Exception("Failed to create page in database")
                
        except Exception as e:
            logger.error(f"Error adding page to chapter: {e}")
            raise e
    
    async def _update_story_page_count(self, story_id: str):
        """Update the total page count for a story"""
        try:
            # Count all pages across all chapters
            chapters_result = self.supabase.table("chapters").select("id").eq("story_id", story_id).execute()
            
            total_pages = 0
            if chapters_result.data:
                for chapter in chapters_result.data:
                    pages_result = self.supabase.table("pages").select("id").eq("chapter_id", chapter["id"]).execute()
                    if pages_result.data:
                        total_pages += len(pages_result.data)
            
            # Update story
            self.supabase.table("stories").update({
                "total_pages": total_pages,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", story_id).execute()
            
        except Exception as e:
            logger.error(f"Error updating story page count: {e}")
    
    async def export_story(self, story_id: str, format: ExportFormat) -> str:
        """Export a story in various formats"""
        try:
            story = await self.get_story(story_id)
            if not story:
                raise Exception("Story not found")
            
            # This would integrate with actual export services
            # For now, return a mock export URL
            
            export_formats = {
                ExportFormat.PDF: "pdf",
                ExportFormat.WEBTOON: "webtoon",
                ExportFormat.INSTAGRAM_CAROUSEL: "instagram"
            }
            
            export_type = export_formats.get(format, "pdf")
            export_url = f"https://otakucanvas.com/exports/{story_id}.{export_type}"
            
            logger.info(f"Story {story_id} exported as {export_type}")
            return export_url
            
        except Exception as e:
            logger.error(f"Error exporting story: {e}")
            raise e
    
    async def get_story_continuity_data(self, story_id: str) -> Dict[str, Any]:
        """Get continuity data for story generation"""
        try:
            story = await self.get_story(story_id)
            if not story:
                return {}
            
            # Build continuity context
            continuity_data = {
                "story_title": story.title,
                "story_style": story.style,
                "total_chapters": len(story.chapters),
                "total_pages": story.total_pages,
                "recent_scenes": []
            }
            
            # Get recent scenes for context
            for chapter in story.chapters[-2:]:  # Last 2 chapters
                for page in chapter.pages[-3:]:  # Last 3 pages per chapter
                    continuity_data["recent_scenes"].append({
                        "chapter": chapter.title,
                        "page": page.page_number,
                        "scene_id": page.scene_id
                    })
            
            return continuity_data
            
        except Exception as e:
            logger.error(f"Error getting story continuity data: {e}")
            return {}
