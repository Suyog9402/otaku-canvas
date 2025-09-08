import os
import base64
import json
import logging
from typing import Dict, List, Any, Optional
import asyncio
import aiofiles
from PIL import Image, ImageDraw, ImageFont
import io

logger = logging.getLogger(__name__)

class DemoImageGenerator:
    """Demo image generator that creates placeholder images for hackathon demo"""
    
    def __init__(self):
        self.generated_images_dir = "./generated_images"
        os.makedirs(self.generated_images_dir, exist_ok=True)
        logger.info("Demo Image Generator initialized")
    
    async def generate_comic_panel(self, 
                                 panel_number: int, 
                                 scene_description: str, 
                                 character_anchor: str = None,
                                 style: str = "manga",
                                 dialogue: str = None) -> Dict[str, Any]:
        """Generate a demo comic panel image with dialogue bubble"""
        
        try:
            # Create a demo image
            width, height = 400, 600
            image = Image.new('RGB', (width, height), color='white')
            draw = ImageDraw.Draw(image)
            
            # Draw panel border
            draw.rectangle([10, 10, width-10, height-10], outline='black', width=3)
            
            # Add panel number
            try:
                title_font = ImageFont.truetype("arial.ttf", 20)
                dialogue_font = ImageFont.truetype("arial.ttf", 16)
                small_font = ImageFont.truetype("arial.ttf", 12)
            except:
                title_font = ImageFont.load_default()
                dialogue_font = ImageFont.load_default()
                small_font = ImageFont.load_default()
            
            draw.text((20, 20), f"Panel {panel_number}", fill='black', font=title_font)
            
            # Add scene description (truncated)
            scene_text = scene_description[:80] + "..." if len(scene_description) > 80 else scene_description
            y_pos = 50
            for line in self._wrap_text(scene_text, 35):
                draw.text((20, y_pos), line, fill='gray', font=small_font)
                y_pos += 15
            
            # Add character info if provided
            if character_anchor:
                draw.text((20, y_pos + 10), "Character:", fill='blue', font=small_font)
                char_text = character_anchor[:60] + "..." if len(character_anchor) > 60 else character_anchor
                for line in self._wrap_text(char_text, 35):
                    y_pos += 15
                    draw.text((20, y_pos), line, fill='blue', font=small_font)
            
            # Add dialogue bubble at the top
            if dialogue:
                self._draw_dialogue_bubble(draw, dialogue, width, height, dialogue_font)
            
            # Add style indicator at bottom
            draw.text((20, height - 30), f"Style: {style}", fill='green', font=small_font)
            draw.text((20, height - 15), "Demo Generated", fill='red', font=small_font)
            
            # Save the image
            timestamp = int(asyncio.get_event_loop().time())
            filename = f"demo_panel_{panel_number}_{timestamp}.png"
            filepath = os.path.join(self.generated_images_dir, filename)
            
            image.save(filepath)
            
            return {
                "success": True,
                "image_url": f"/generated_images/{filename}",
                "image_path": filepath,
                "prompt_used": scene_description,
                "generation_time": 0.5,
                "demo": True,
                "panel_number": panel_number,
                "dialogue": dialogue
            }
            
        except Exception as e:
            logger.error(f"Error generating demo panel: {e}")
            return {
                "success": False,
                "error": str(e),
                "image_url": "/images/placeholders/akira.svg",
                "demo": True
            }
    
    def _draw_dialogue_bubble(self, draw, dialogue: str, width: int, height: int, font):
        """Draw a comic-style dialogue bubble"""
        try:
            # Dialogue bubble dimensions
            bubble_width = width - 40
            bubble_height = 80
            bubble_x = 20
            bubble_y = 100
            
            # Draw bubble background (white with black border)
            draw.rectangle([bubble_x, bubble_y, bubble_x + bubble_width, bubble_y + bubble_height], 
                         fill='white', outline='black', width=2)
            
            # Draw bubble tail (pointing down)
            tail_points = [
                (bubble_x + bubble_width // 2 - 10, bubble_y + bubble_height),
                (bubble_x + bubble_width // 2, bubble_y + bubble_height + 15),
                (bubble_x + bubble_width // 2 + 10, bubble_y + bubble_height)
            ]
            draw.polygon(tail_points, fill='white', outline='black', width=2)
            
            # Add dialogue text
            dialogue_lines = self._wrap_text(dialogue, 45)
            text_y = bubble_y + 15
            for line in dialogue_lines[:3]:  # Max 3 lines
                text_width = draw.textlength(line, font=font)
                text_x = bubble_x + (bubble_width - text_width) // 2
                draw.text((text_x, text_y), line, fill='black', font=font)
                text_y += 18
            
        except Exception as e:
            logger.error(f"Error drawing dialogue bubble: {e}")
    
    def _wrap_text(self, text: str, max_width: int) -> List[str]:
        """Wrap text to fit within max_width characters"""
        words = text.split()
        lines = []
        current_line = []
        
        for word in words:
            if len(' '.join(current_line + [word])) <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    lines.append(word)
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines
    
    async def generate_multiple_panels(self, 
                                     panel_descriptions: List[str], 
                                     character_anchor: str = None,
                                     style: str = "manga") -> List[Dict[str, Any]]:
        """Generate multiple demo panels"""
        
        panels = []
        for i, description in enumerate(panel_descriptions):
            panel = await self.generate_comic_panel(
                panel_number=i + 1,
                scene_description=description,
                character_anchor=character_anchor,
                style=style
            )
            panels.append(panel)
        
        return panels
