"""
Mock data service for testing without Supabase
Use this when you want to test the app without setting up the database
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

from models.character import Character, CharacterCreate
from models.scene import Scene, SceneCreate, Panel
from models.story import Story, Chapter, Page

logger = logging.getLogger(__name__)

class MockDataService:
    """Mock data service for development and testing"""
    
    def __init__(self):
        self.characters = []
        self.scenes = []
        self.stories = []
        self._initialize_mock_data()
    
    def _initialize_mock_data(self):
        """Initialize with some sample data"""
        
        # Sample characters
        sample_characters = [
            {
                "name": "Akira",
                "description": "A brave young warrior with a mysterious past",
                "archetype": "hero",
                "style": "manga",
                "traits": ["brave", "mysterious", "determined"],
                "appearance": {"hair": "black", "eyes": "brown", "clothing": "red jacket"},
                "personality": {"brave": True, "loyal": True},
                "backstory": "Raised by a master swordsman",
                "image_url": "/images/placeholders/akira.svg",
                "user_id": "default_user"
            },
            {
                "name": "Shadow",
                "description": "A dark sorcerer seeking ultimate power",
                "archetype": "villain",
                "style": "manga",
                "traits": ["powerful", "dark", "ambitious"],
                "appearance": {"hair": "white", "eyes": "red", "clothing": "black robes"},
                "personality": {"ambitious": True, "ruthless": True},
                "backstory": "Former student who turned to dark magic",
                "image_url": "/images/placeholders/shadow.svg",
                "user_id": "default_user"
            }
        ]
        
        for char_data in sample_characters:
            character = Character(
                id=str(uuid.uuid4()),
                prompt_anchor=f"{char_data['name']}, {char_data['description']}, {char_data['archetype']} character",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                **char_data
            )
            self.characters.append(character)
        
        # Sample scenes
        sample_scenes = [
            {
                "prompt": "Akira faces off against Shadow in a dramatic battle",
                "character_ids": [self.characters[0].id, self.characters[1].id],
                "style": "manga",
                "layout": "double",
                "panels": [
                    {
                        "id": str(uuid.uuid4()),
                        "index": 0,
                        "prompt": "Akira draws his sword",
                        "image_url": "/images/placeholders/akira.svg",
                        "description": "Akira prepares for battle",
                        "character_ids": [self.characters[0].id],
                        "position": {"x": 0, "y": 0},
                        "size": {"width": 400, "height": 300}
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "index": 1,
                        "prompt": "Shadow casts a dark spell",
                        "image_url": "/images/placeholders/shadow.svg",
                        "description": "Shadow attacks with dark magic",
                        "character_ids": [self.characters[1].id],
                        "position": {"x": 400, "y": 0},
                        "size": {"width": 400, "height": 300}
                    }
                ],
                "user_id": "default_user"
            }
        ]
        
        for scene_data in sample_scenes:
            scene = Scene(
                id=str(uuid.uuid4()),
                previous_scene_context=None,
                next_scene_hint=None,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                story_continuity_score=0.8,
                **scene_data
            )
            self.scenes.append(scene)
        
        # Sample stories
        sample_stories = [
            {
                "title": "The Battle Begins",
                "description": "Akira's journey to defeat the dark sorcerer Shadow",
                "user_id": "default_user",
                "style": "manga",
                "total_pages": 2
            }
        ]
        
        for story_data in sample_stories:
            story = Story(
                id=str(uuid.uuid4()),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                chapters=[],
                **story_data
            )
            self.stories.append(story)
    
    # Character methods
    async def create_character(self, character_data: CharacterCreate) -> Character:
        """Create a new character"""
        character = Character(
            id=str(uuid.uuid4()),
            **character_data.dict(),
            prompt_anchor=f"{character_data.name}, {character_data.description}, {character_data.archetype} character",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        self.characters.append(character)
        return character
    
    async def get_character(self, character_id: str) -> Optional[Character]:
        """Get a character by ID"""
        for char in self.characters:
            if char.id == character_id:
                return char
        return None
    
    async def get_user_characters(self, user_id: str = "default_user") -> List[Character]:
        """Get all characters for a user"""
        return [char for char in self.characters if char.user_id == user_id]
    
    async def update_character(self, character_id: str, character_data: CharacterCreate) -> Character:
        """Update a character"""
        for i, char in enumerate(self.characters):
            if char.id == character_id:
                updated_character = Character(
                    id=character_id,
                    **character_data.dict(),
                    prompt_anchor=f"{character_data.name}, {character_data.description}, {character_data.archetype} character",
                    created_at=char.created_at,
                    updated_at=datetime.utcnow()
                )
                self.characters[i] = updated_character
                return updated_character
        raise Exception("Character not found")
    
    async def delete_character(self, character_id: str) -> bool:
        """Delete a character"""
        for i, char in enumerate(self.characters):
            if char.id == character_id:
                del self.characters[i]
                return True
        raise Exception("Character not found")
    
    async def get_character_prompt_anchors(self, character_ids: List[str]) -> Dict[str, str]:
        """Get prompt anchors for multiple characters"""
        anchors = {}
        for char in self.characters:
            if char.id in character_ids:
                anchors[char.id] = char.prompt_anchor
        return anchors
    
    # Scene methods
    async def create_scene(self, scene_data: SceneCreate) -> Scene:
        """Create a new scene"""
        scene = Scene(
            id=str(uuid.uuid4()),
            **scene_data.dict(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            story_continuity_score=0.8
        )
        self.scenes.append(scene)
        return scene
    
    async def get_scene(self, scene_id: str) -> Optional[Scene]:
        """Get a scene by ID"""
        for scene in self.scenes:
            if scene.id == scene_id:
                return scene
        return None
    
    # Story methods
    async def create_story(self, title: str, description: str = "", user_id: str = "default_user") -> Story:
        """Create a new story"""
        story = Story(
            id=str(uuid.uuid4()),
            title=title,
            description=description,
            user_id=user_id,
            style="manga",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            total_pages=0,
            chapters=[]
        )
        self.stories.append(story)
        return story
    
    async def get_story(self, story_id: str) -> Optional[Story]:
        """Get a story by ID"""
        for story in self.stories:
            if story.id == story_id:
                return story
        return None
    
    async def get_user_stories(self, user_id: str = "default_user") -> List[Story]:
        """Get all stories for a user"""
        return [story for story in self.stories if story.user_id == user_id]

# Global mock service instance
mock_data_service = MockDataService()
