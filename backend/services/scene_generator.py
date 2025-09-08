import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
import json

from models.scene import Scene, SceneCreate, Panel, PanelLayout, SceneStyle
from services.gemini_api import GeminiAPIService
from services.character_service import CharacterService

logger = logging.getLogger(__name__)

class SceneGenerator:
    def __init__(self):
        self.gemini_api = GeminiAPIService()
        self.character_service = CharacterService()
    
    def _break_down_scene_prompt(self, scene_prompt: str, layout: PanelLayout) -> List[str]:
        """Break down a scene prompt into individual panel prompts"""
        
        # Basic panel breakdown based on layout
        if layout == PanelLayout.SINGLE:
            return [scene_prompt]
        
        elif layout == PanelLayout.DOUBLE:
            # Split into two panels: setup and action/result
            return [
                f"Wide establishing shot: {scene_prompt}",
                f"Close-up action shot: {scene_prompt}"
            ]
        
        elif layout == PanelLayout.TRIPLE:
            # Split into three panels: setup, action, result
            return [
                f"Opening panel - scene setup: {scene_prompt}",
                f"Middle panel - main action: {scene_prompt}",
                f"Closing panel - resolution: {scene_prompt}"
            ]
        
        elif layout == PanelLayout.VERTICAL_SCROLL:
            # Create 4-5 panels for vertical scroll
            return [
                f"Panel 1 - Scene introduction: {scene_prompt}",
                f"Panel 2 - Character interaction: {scene_prompt}",
                f"Panel 3 - Action sequence: {scene_prompt}",
                f"Panel 4 - Climax moment: {scene_prompt}",
                f"Panel 5 - Resolution: {scene_prompt}"
            ]
        
        return [scene_prompt]
    
    def _calculate_continuity_score(self, 
                                  character_anchors: Dict[str, str], 
                                  previous_context: Optional[str],
                                  current_panels: List[Panel]) -> float:
        """Calculate a continuity score for the generated scene"""
        
        score = 0.0
        
        # Base score for having characters
        if character_anchors:
            score += 0.3
        
        # Bonus for previous context
        if previous_context:
            score += 0.2
        
        # Bonus for multiple panels (better storytelling)
        if len(current_panels) > 1:
            score += 0.2
        
        # Check for character consistency in prompts
        character_mentions = 0
        for panel in current_panels:
            for char_id in character_anchors.keys():
                if char_id in panel.prompt:
                    character_mentions += 1
        
        if character_mentions > 0:
            score += min(0.3, character_mentions * 0.1)
        
        return min(1.0, score)
    
    def _detect_content_type(self, prompt: str) -> str:
        """Detect if prompt is for environment, character, or mixed content"""
        
        environment_keywords = [
            'landscape', 'temple', 'building', 'mountains', 'cityscape', 'architecture',
            'forest', 'garden', 'street', 'interior', 'exterior', 'view', 'scene',
            'photograph', 'photography', 'photorealistic', 'realistic', 'environment'
        ]
        
        character_keywords = [
            'person', 'character', 'hero', 'warrior', 'woman', 'man', 'girl', 'boy',
            'figure', 'people', 'human', 'character', 'protagonist', 'villain'
        ]
        
        prompt_lower = prompt.lower()
        
        has_environment = any(keyword in prompt_lower for keyword in environment_keywords)
        has_character = any(keyword in prompt_lower for keyword in character_keywords)
        
        if has_environment and not has_character:
            return 'pure_environment'
        elif has_character and not has_environment:
            return 'character_focused'
        else:
            return 'mixed_content'
    
    def _detect_style_from_prompt(self, prompt: str) -> str:
        """Detect art style from prompt content"""
        
        prompt_lower = prompt.lower()
        
        if any(keyword in prompt_lower for keyword in ['photorealistic', 'photograph', 'photography', 'realistic', 'professional camera']):
            return 'photorealistic'
        elif any(keyword in prompt_lower for keyword in ['manga', 'anime', 'comic', 'illustration']):
            return 'manga'
        elif any(keyword in prompt_lower for keyword in ['manhwa', 'webtoon', 'korean']):
            return 'manhwa'
        else:
            return 'manga'  # default
    
    def _get_appropriate_layout(self, content_type: str, current_layout: str) -> str:
        """Suggest appropriate layout based on content type"""
        
        if content_type == 'pure_environment':
            return 'single'  # Environments work better as single full images
        else:
            return current_layout  # Keep user's choice for character content
    
    async def generate_scene(self, scene_data: SceneCreate) -> Scene:
        """Generate a complete scene with multiple panels"""
        
        try:
            scene_id = str(uuid.uuid4())
            
            # Detect content type and style from prompt
            content_type = self._detect_content_type(scene_data.prompt)
            detected_style = self._detect_style_from_prompt(scene_data.prompt)
            
            # Get character prompt anchors (only if characters are needed)
            character_anchors = {}
            if content_type != 'pure_environment' and scene_data.character_ids:
                character_anchors = await self.character_service.get_character_prompt_anchors(scene_data.character_ids)
            
            # Use detected style if it conflicts with interface setting
            final_style = detected_style if detected_style != 'manga' else scene_data.style.value
            
            # Get appropriate layout
            appropriate_layout = self._get_appropriate_layout(content_type, scene_data.layout.value)
            
            # Break down scene into panels
            panel_prompts = self._break_down_scene_prompt(scene_data.prompt, scene_data.layout)
            
            # Generate panels with context isolation
            panel_results = await self.gemini_api.generate_multiple_panels(
                panel_prompts,
                character_anchors,
                final_style,
                scene_data.previous_scene_context,
                scene_data.next_scene_hint,
                content_type=content_type
            )
            
            # Create panel objects
            panels = []
            for i, result in enumerate(panel_results):
                panel = Panel(
                    id=str(uuid.uuid4()),
                    index=i,
                    prompt=result["panel_prompt"],
                    image_url=result["image_url"],
                    description=result["panel_prompt"],
                    character_ids=scene_data.character_ids,
                    position={"x": 0, "y": i * 200},  # Default positioning
                    size={"width": 800, "height": 600}  # Default size
                )
                panels.append(panel)
            
            # Calculate continuity score
            continuity_score = self._calculate_continuity_score(
                character_anchors,
                scene_data.previous_scene_context,
                panels
            )
            
            # Create scene object
            scene = Scene(
                id=scene_id,
                prompt=scene_data.prompt,
                character_ids=scene_data.character_ids,
                style=scene_data.style,
                layout=scene_data.layout,
                panels=panels,
                previous_scene_context=scene_data.previous_scene_context,
                next_scene_hint=scene_data.next_scene_hint,
                user_id=scene_data.user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                story_continuity_score=continuity_score
            )
            
            logger.info(f"Scene {scene_id} generated with {len(panels)} panels, continuity score: {continuity_score}")
            return scene
            
        except Exception as e:
            logger.error(f"Error generating scene: {e}")
            raise e
    
    async def regenerate_panel(self, scene_id: str, panel_index: int, new_prompt: str) -> Scene:
        """Regenerate a specific panel in a scene"""
        
        try:
            # This would typically fetch the scene from database
            # For now, we'll create a mock implementation
            
            # Get character anchors (would be from the original scene)
            character_anchors = {}  # Would fetch from scene
            
            # Regenerate the panel
            panel_result = await self.gemini_api.regenerate_panel(
                new_prompt,
                character_anchors,
                "manga"  # Would get from scene
            )
            
            # Create updated panel
            updated_panel = Panel(
                id=str(uuid.uuid4()),
                index=panel_index,
                prompt=new_prompt,
                image_url=panel_result["image_url"],
                description=new_prompt,
                character_ids=[],  # Would get from original panel
                position={"x": 0, "y": panel_index * 200},
                size={"width": 800, "height": 600}
            )
            
            # Return updated scene (would fetch and update in database)
            # This is a simplified implementation
            logger.info(f"Panel {panel_index} regenerated for scene {scene_id}")
            
            # Mock return - in real implementation, would return the updated scene
            return None
            
        except Exception as e:
            logger.error(f"Error regenerating panel: {e}")
            raise e
    
    def _enhance_prompt_for_continuity(self, 
                                     base_prompt: str, 
                                     character_anchors: Dict[str, str],
                                     previous_context: Optional[str]) -> str:
        """Enhance a prompt with continuity information"""
        
        enhanced_parts = [base_prompt]
        
        if previous_context:
            enhanced_parts.append(f"Continuing from: {previous_context}")
        
        if character_anchors:
            enhanced_parts.append("Maintaining character consistency:")
            for char_id, anchor in character_anchors.items():
                enhanced_parts.append(f"- {anchor}")
        
        return "\n".join(enhanced_parts)
    
    async def generate_story_continuation(self, 
                                        base_scene: Scene, 
                                        continuation_prompt: str) -> Scene:
        """Generate a scene that continues from a previous scene"""
        
        try:
            # Build context from previous scene
            previous_context = f"Previous scene: {base_scene.prompt}"
            if base_scene.panels:
                previous_context += f" (Last panel: {base_scene.panels[-1].description})"
            
            # Create new scene data
            continuation_data = SceneCreate(
                prompt=continuation_prompt,
                character_ids=base_scene.character_ids,
                style=base_scene.style,
                layout=base_scene.layout,
                previous_scene_context=previous_context,
                next_scene_hint=None,
                user_id=base_scene.user_id
            )
            
            # Generate the continuation scene
            return await self.generate_scene(continuation_data)
            
        except Exception as e:
            logger.error(f"Error generating story continuation: {e}")
            raise e