import os
import base64
import json
import logging
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
from io import BytesIO
import asyncio
import aiofiles

load_dotenv()
logger = logging.getLogger(__name__)

class GeminiAPIService:
    """Proper Nano Banana (Gemini 2.5 Flash Image) implementation"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found. Image generation will be disabled.")
            return
            
        try:
            genai.configure(api_key=self.api_key)
            # CRITICAL FIX: Use the correct model for image generation
            self.model = genai.GenerativeModel('gemini-2.5-flash-image-preview')
            logger.info("Nano Banana API service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Nano Banana API: {e}")
    
    def detect_content_type(self, prompt: str) -> str:
        """Auto-detect content type to prevent interface conflicts"""
        environment_keywords = [
            'landscape', 'temple', 'building', 'mountains', 'cityscape', 'architecture', 
            'room', 'interior', 'exterior', 'view', 'scene', 'photograph', 'photography', 
            'photorealistic', 'realistic', 'environment', 'forest', 'garden', 'street'
        ]
        character_keywords = [
            'person', 'character', 'hero', 'warrior', 'woman', 'man', 'girl', 'boy',
            'figure', 'people', 'human', 'character', 'protagonist', 'villain'
        ]
        
        prompt_lower = prompt.lower()
        has_environment = any(keyword in prompt_lower for keyword in environment_keywords)
        has_characters = any(keyword in prompt_lower for keyword in character_keywords)
        
        if has_environment and not has_characters:
            return "pure_environment"
        elif has_characters and not has_environment:
            return "pure_character"
        else:
            return "mixed_content"
    
    def build_optimal_prompt(self, 
                           scene_prompt: str, 
                           character_anchors: Dict[str, str] = None, 
                           style: str = "photorealistic",
                           content_type: str = None) -> str:
        """Build optimized prompts using the 5-layer architecture"""
        
        if content_type is None:
            content_type = self.detect_content_type(scene_prompt)
        
        # Style definitions optimized for Nano Banana
        style_specs = {
            "photorealistic": "Ultra-high resolution photorealistic photography with professional camera quality, sharp focus, natural lighting, realistic textures and materials",
            "manga": "Manga art style with clean line art, black and white with screentones, detailed illustration, Japanese comic book style",
            "manhwa": "Manhwa art style with vibrant colors, clean digital line art, modern Korean webtoon style, vertical composition optimized",
            "western_comic": "Western comic book style with bold colors, dynamic composition, American superhero comic art style",
            "architectural": "Professional architectural photography with wide-angle lens, perfect lighting, ultra-sharp detail, magazine quality"
        }
        
        if content_type == "pure_environment":
            # Environment-focused prompt (fixes your interface issue)
            prompt_parts = [
                f"CONTENT_TYPE: Environmental/Architectural Photography - NO CHARACTERS",
                f"SCENE DESCRIPTION: {scene_prompt}",
                f"CAMERA SPECIFICATIONS: Professional wide-angle lens capturing the complete scene with perfect composition",
                f"LIGHTING CONDITIONS: Natural environmental lighting optimized for the scene and time of day",
                f"VISUAL STYLE: {style_specs.get(style, style_specs['photorealistic'])}",
                f"FORMAT: Full landscape format optimized for architectural/environmental photography",
                f"EXCLUSIONS: No people, no characters, no figures, no human presence visible",
                f"FOCUS PRIORITY: Architecture, landscape, atmosphere, environmental details, and natural elements only"
            ]
        
        elif content_type == "pure_character":
            # Character-focused prompt
            character_descriptions = []
            if character_anchors:
                for char_id, anchor in character_anchors.items():
                    character_descriptions.append(f"- {char_id}: {anchor}")
            
            prompt_parts = [
                f"CONTENT_TYPE: Character Portrait/Scene",
                f"SCENE DESCRIPTION: {scene_prompt}",
                "CHARACTER DNA SPECIFICATIONS:"
            ]
            prompt_parts.extend(character_descriptions)
            prompt_parts.extend([
                f"VISUAL STYLE: {style_specs.get(style, style_specs['manga'])}",
                f"COMPOSITION: Dynamic character-focused composition with proper lighting and backgrounds",
                f"QUALITY: High-detail character rendering with consistent features and expressions"
            ])
        
        else:
            # Mixed content
            prompt_parts = [
                f"CONTENT_TYPE: Mixed Scene with Characters and Environment",
                f"SCENE DESCRIPTION: {scene_prompt}",
                f"VISUAL STYLE: {style_specs.get(style, style_specs['photorealistic'])}",
                f"BALANCE: Harmonious integration of characters within environmental context"
            ]
            
            if character_anchors:
                prompt_parts.append("CHARACTER CONSISTENCY:")
                for char_id, anchor in character_anchors.items():
                    prompt_parts.append(f"- {char_id}: {anchor}")
        
        return "\n".join(prompt_parts)
    
    def _build_sequential_prompt(self, 
                                scene_prompt: str, 
                                character_anchors: Dict[str, str], 
                                style: str,
                                previous_context: Optional[str] = None,
                                next_hint: Optional[str] = None,
                                content_type: str = "mixed_content") -> str:
        """Build a prompt with story continuity for sequential scenes"""
        
        base_prompt = self.build_optimal_prompt(scene_prompt, character_anchors, style, content_type)
        
        continuity_parts = []
        
        if previous_context:
            continuity_parts.append(f"Previous scene context: {previous_context}")
        
        continuity_parts.append(f"Current scene: {scene_prompt}")
        
        if next_hint:
            continuity_parts.append(f"Next scene hint: {next_hint}")
        
        # Add continuity instructions based on content type
        if content_type == "pure_environment":
            continuity_parts.extend([
                "",
                "Maintain environmental consistency with previous scenes:",
                "- Keep architectural details consistent",
                "- Maintain consistent lighting and atmosphere",
                "- Ensure smooth visual flow between environmental shots",
                "- Preserve landscape and setting details"
            ])
        else:
            continuity_parts.extend([
                "",
                "Maintain visual consistency with previous panels:",
                "- Keep character designs identical",
                "- Maintain consistent art style and coloring",
                "- Ensure smooth visual flow between panels",
                "- Preserve character positioning and relationships"
            ])
        
        return base_prompt + "\n\n" + "\n".join(continuity_parts)
    
    async def generate_image(self, prompt: str) -> Dict[str, Any]:
        """Generate single image using Nano Banana"""
        
        if not self.api_key:
            # Return appropriate placeholder based on content type
            content_type = self.detect_content_type(prompt)
            if content_type == "pure_environment":
                image_url = "/images/placeholders/environment.svg"
            else:
                image_url = "/images/placeholders/akira.svg"
            
            return {
                "success": True,
                "image_url": image_url,
                "prompt_used": prompt,
                "generation_time": 2.0,
                "mock": True
            }
        
        try:
            # CRITICAL: Use generate_content for image generation
            response = self.model.generate_content(prompt)
            
            # Extract the generated image
            if response.candidates and len(response.candidates) > 0:
                candidate = response.candidates[0]
                
                if candidate.content and candidate.content.parts:
                    for part in candidate.content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data:
                            # Extract image data
                            image_data = part.inline_data.data
                            image_format = part.inline_data.mime_type
                            
                            # Convert to PIL Image
                            image = Image.open(BytesIO(image_data))
                            
                            # Save image
                            timestamp = int(asyncio.get_event_loop().time())
                            filename = f"generated_image_{timestamp}.png"
                            filepath = f"./generated_images/{filename}"
                            
                            # Ensure directory exists
                            os.makedirs("./generated_images", exist_ok=True)
                            image.save(filepath)
                            
                            return {
                                "success": True,
                                "image_path": filepath,
                                "image_url": f"/generated_images/{filename}",
                                "prompt_used": prompt,
                                "generation_time": 10.0,
                                "image_format": image_format
                            }
            
            # If no image found in response, return placeholder
            content_type = self.detect_content_type(prompt)
            if content_type == "pure_environment":
                image_url = "/images/placeholders/environment.svg"
            else:
                image_url = "/images/placeholders/akira.svg"
            
            return {
                "success": True,
                "image_url": image_url,
                "prompt_used": prompt,
                "generation_time": 2.0,
                "fallback": True,
                "response_text": getattr(response, 'text', 'No text response')
            }
                
        except Exception as e:
            logger.error(f"Error generating image with Nano Banana: {e}")
            # Return appropriate placeholder on error
            content_type = self.detect_content_type(prompt)
            if content_type == "pure_environment":
                image_url = "/images/placeholders/environment.svg"
            else:
                image_url = "/images/placeholders/akira.svg"
            
            return {
                "success": False,
                "error": str(e),
                "prompt_used": prompt,
                "image_url": image_url
            }
    
    async def generate_single_panel(self, 
                                  scene_prompt: str, 
                                  character_anchors: Dict[str, str], 
                                  style: str = "manga",
                                  previous_context: Optional[str] = None,
                                  next_hint: Optional[str] = None,
                                  content_type: str = "mixed_content") -> Dict[str, Any]:
        """Generate a single panel image using Google Gemini"""
        
        try:
            # Build the prompt with continuity and content type awareness
            if previous_context or next_hint:
                prompt = self._build_sequential_prompt(scene_prompt, character_anchors, style, previous_context, next_hint, content_type)
            else:
                prompt = self.build_optimal_prompt(scene_prompt, character_anchors, style, content_type)
            
            # Generate the image
            result = await self.generate_image(prompt)
            
            return {
                "image_url": result["image_url"],
                "generation_time": result.get("generation_time", 2.0),
                "prompt_used": result["prompt_used"],
                "success": result["success"],
                "error": result.get("error")
            }
                
        except Exception as e:
            logger.error(f"Error generating panel with Gemini: {e}")
            # Return appropriate placeholder on error
            if content_type == "pure_environment":
                image_url = "/images/placeholders/environment.svg"
            else:
                image_url = "/images/placeholders/akira.svg"
            
            return {
                "image_url": image_url,
                "generation_time": 0,
                "prompt_used": scene_prompt,
                "success": False,
                "error": str(e)
            }
    
    async def generate_multiple_panels(self, 
                                     panel_prompts: List[str], 
                                     character_anchors: Dict[str, str], 
                                     style: str = "manga",
                                     previous_context: Optional[str] = None,
                                     next_hint: Optional[str] = None,
                                     content_type: str = "mixed_content") -> List[Dict[str, Any]]:
        """Generate multiple panels for a scene with consistency"""
        
        panels = []
        
        for i, panel_prompt in enumerate(panel_prompts):
            # Add panel-specific context
            panel_context = f"Panel {i+1} of {len(panel_prompts)}: {panel_prompt}"
            
            # Generate the panel
            panel_result = await self.generate_single_panel(
                panel_context,
                character_anchors,
                style,
                previous_context,
                next_hint,
                content_type
            )
            
            panels.append({
                **panel_result,
                "panel_index": i,
                "panel_prompt": panel_prompt
            })
        
        return panels
    
    async def regenerate_panel(self, 
                             panel_prompt: str, 
                             character_anchors: Dict[str, str], 
                             style: str = "manga",
                             previous_context: Optional[str] = None) -> Dict[str, Any]:
        """Regenerate a specific panel with improved consistency"""
        
        # Add regeneration context
        enhanced_prompt = f"Regenerate this panel with improved consistency: {panel_prompt}"
        
        return await self.generate_single_panel(
            enhanced_prompt,
            character_anchors,
            style,
            previous_context
        )
    
    async def generate_story_suggestions(self, current_scene: str, characters: List[str]) -> List[str]:
        """Use Gemini to generate story continuation suggestions"""
        
        if not self.api_key:
            return [
                "The hero faces a new challenge",
                "A mysterious character appears",
                "The plot takes an unexpected turn"
            ]
        
        try:
            prompt = f"""
            Based on this current scene: "{current_scene}"
            And these characters: {', '.join(characters)}
            
            Generate 3 creative story continuation suggestions for the next scene.
            Each suggestion should be 1-2 sentences and advance the plot.
            """
            
            response = self.model.generate_content(prompt)
            
            # Parse the response into individual suggestions
            suggestions = []
            if hasattr(response, 'text'):
                lines = response.text.strip().split('\n')
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        suggestions.append(line)
            
            return suggestions[:3] if suggestions else [
                "The hero faces a new challenge",
                "A mysterious character appears", 
                "The plot takes an unexpected turn"
            ]
            
        except Exception as e:
            logger.error(f"Error generating story suggestions: {e}")
            return [
                "The hero faces a new challenge",
                "A mysterious character appears",
                "The plot takes an unexpected turn"
            ]
    
    async def enhance_character_description(self, character_description: str, style: str) -> str:
        """Use Gemini to enhance character descriptions for better consistency"""
        
        if not self.api_key:
            return character_description
        
        try:
            prompt = f"""
            Enhance this character description for {style} style comic generation:
            "{character_description}"
            
            Make it more detailed and specific for consistent AI image generation.
            Include specific visual details about appearance, clothing, and style.
            Keep it under 200 words.
            """
            
            response = self.model.generate_content(prompt)
            
            if hasattr(response, 'text'):
                return response.text.strip()
            else:
                return character_description
                
        except Exception as e:
            logger.error(f"Error enhancing character description: {e}")
            return character_description