import uuid
from datetime import datetime
from typing import List, Optional, Dict
import logging
from supabase import create_client, Client
import os
from dotenv import load_dotenv

from models.character import Character, CharacterCreate, CharacterArchetype
from services.mock_data_service import mock_data_service

load_dotenv()

logger = logging.getLogger(__name__)

class CharacterService:
    def __init__(self):
        self.use_mock_data = False
        self.supabase = None
        
        # Try to initialize Supabase
        if os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_ANON_KEY"):
            try:
                self.supabase: Client = create_client(
                    os.getenv("SUPABASE_URL"),
                    os.getenv("SUPABASE_ANON_KEY")
                )
                # Test the connection by trying to access a table
                test_result = self.supabase.table("characters").select("id").limit(1).execute()
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Supabase or tables don't exist, using mock data: {e}")
                self.use_mock_data = True
                self.supabase = None
        else:
            logger.info("Using mock data service (no Supabase credentials found)")
            self.use_mock_data = True
    
    def _generate_prompt_anchor(self, character: CharacterCreate) -> str:
        """Generate a consistent prompt anchor for character consistency across scenes"""
        archetype_descriptions = {
            CharacterArchetype.HERO: "a heroic protagonist",
            CharacterArchetype.VILLAIN: "a menacing antagonist", 
            CharacterArchetype.SUPPORTING: "a supporting character",
            CharacterArchetype.COMEDIC: "a comedic relief character",
            CharacterArchetype.MYSTERIOUS: "a mysterious character",
            CharacterArchetype.ROMANTIC: "a romantic character"
        }
        
        base_description = f"{character.name}, {archetype_descriptions.get(character.archetype, 'a character')}"
        
        # Add appearance details
        if character.appearance:
            appearance_parts = []
            for key, value in character.appearance.items():
                if value:
                    appearance_parts.append(f"{key}: {value}")
            if appearance_parts:
                base_description += f", {', '.join(appearance_parts)}"
        
        # Add personality traits
        if character.traits:
            base_description += f", personality traits: {', '.join(character.traits)}"
        
        # Add style specification
        style_descriptions = {
            "manga": "in manga art style",
            "manhwa": "in manhwa art style", 
            "western_comic": "in western comic book style"
        }
        base_description += f", {style_descriptions.get(character.style, 'in manga art style')}"
        
        return base_description
    
    async def create_character(self, character_data: CharacterCreate) -> Character:
        """Create a new character with prompt anchoring"""
        if self.use_mock_data:
            return await mock_data_service.create_character(character_data)
        
        try:
            character_id = str(uuid.uuid4())
            prompt_anchor = self._generate_prompt_anchor(character_data)
            
            character = Character(
                id=character_id,
                **character_data.dict(),
                prompt_anchor=prompt_anchor,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Store in Supabase
            character_dict = character.dict()
            # Convert datetime objects to ISO format strings
            if isinstance(character_dict['created_at'], datetime):
                character_dict['created_at'] = character_dict['created_at'].isoformat()
            if isinstance(character_dict['updated_at'], datetime):
                character_dict['updated_at'] = character_dict['updated_at'].isoformat()
            result = self.supabase.table("characters").insert(character_dict).execute()
            
            if result.data:
                logger.info(f"Character {character_id} created successfully")
                return character
            else:
                raise Exception("Failed to create character in database")
                
        except Exception as e:
            logger.error(f"Error creating character: {e}")
            raise e
    
    async def get_character(self, character_id: str) -> Optional[Character]:
        """Get a character by ID"""
        if self.use_mock_data:
            return await mock_data_service.get_character(character_id)
        
        try:
            result = self.supabase.table("characters").select("*").eq("id", character_id).execute()
            
            if result.data:
                character_data = result.data[0]
                return Character(**character_data)
            return None
            
        except Exception as e:
            logger.error(f"Error fetching character {character_id}: {e}")
            raise e
    
    async def get_user_characters(self, user_id: str = "default_user") -> List[Character]:
        """Get all characters for a user"""
        if self.use_mock_data:
            return await mock_data_service.get_user_characters(user_id)
        
        try:
            result = self.supabase.table("characters").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            
            characters = []
            if result.data:
                for char_data in result.data:
                    characters.append(Character(**char_data))
            
            return characters
            
        except Exception as e:
            logger.error(f"Error fetching user characters: {e}")
            raise e
    
    async def update_character(self, character_id: str, character_data: CharacterCreate) -> Character:
        """Update a character"""
        try:
            # Get existing character
            existing = await self.get_character(character_id)
            if not existing:
                raise Exception("Character not found")
            
            # Generate new prompt anchor
            prompt_anchor = self._generate_prompt_anchor(character_data)
            
            # Update character
            updated_character = Character(
                id=character_id,
                **character_data.dict(),
                prompt_anchor=prompt_anchor,
                created_at=existing.created_at,
                updated_at=datetime.utcnow()
            )
            
            # Update in database
            result = self.supabase.table("characters").update(updated_character.dict()).eq("id", character_id).execute()
            
            if result.data:
                logger.info(f"Character {character_id} updated successfully")
                return updated_character
            else:
                raise Exception("Failed to update character in database")
                
        except Exception as e:
            logger.error(f"Error updating character {character_id}: {e}")
            raise e
    
    async def delete_character(self, character_id: str) -> bool:
        """Delete a character"""
        try:
            result = self.supabase.table("characters").delete().eq("id", character_id).execute()
            
            if result.data:
                logger.info(f"Character {character_id} deleted successfully")
                return True
            else:
                raise Exception("Character not found or already deleted")
                
        except Exception as e:
            logger.error(f"Error deleting character {character_id}: {e}")
            raise e
    
    async def get_character_prompt_anchors(self, character_ids: List[str]) -> Dict[str, str]:
        """Get prompt anchors for multiple characters for scene generation"""
        if self.use_mock_data:
            return await mock_data_service.get_character_prompt_anchors(character_ids)
        
        try:
            result = self.supabase.table("characters").select("id, prompt_anchor").in_("id", character_ids).execute()
            
            anchors = {}
            if result.data:
                for char_data in result.data:
                    anchors[char_data["id"]] = char_data["prompt_anchor"]
            
            return anchors
            
        except Exception as e:
            logger.error(f"Error fetching character prompt anchors: {e}")
            raise e
