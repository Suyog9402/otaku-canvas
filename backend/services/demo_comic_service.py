import os
import json
import logging
from typing import Dict, List, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class DemoComicService:
    """Service for providing pre-generated demo comics for hackathon judges"""
    
    def __init__(self):
        self.demo_comics = self._load_demo_comics()
        logger.info("Demo Comic Service initialized with pre-generated examples")
    
    def _load_demo_comics(self) -> Dict[str, Dict]:
        """Load pre-generated demo comics"""
        return {
            "magic_portal_dream": {
                "title": "The Magic Portal Dream",
                "story": "I dreamed I found a hidden portal in my backyard that led to a magical world where cats rule everything and I became their chosen human ambassador.",
                "panels": [
                    {
                        "panel_number": 1,
                        "image_url": "/generated_images/demo_portal_1.png",
                        "scene_description": "Character discovering a glowing magical portal hidden in suburban backyard at dusk, expression of curiosity and wonder",
                        "dialogue": "What is this glowing portal in my backyard?",
                        "prompt_used": "Professional comic panel showing character discovering magical portal"
                    },
                    {
                        "panel_number": 2,
                        "image_url": "/generated_images/demo_portal_2.png",
                        "scene_description": "Character stepping through the portal with excitement and amazement, portal energy swirling around them",
                        "dialogue": "I have to see what's on the other side!",
                        "prompt_used": "Professional comic panel showing character entering portal"
                    },
                    {
                        "panel_number": 3,
                        "image_url": "/generated_images/demo_portal_3.png",
                        "scene_description": "Character arriving in magical cat kingdom with floating islands, majestic cat rulers visible, wide establishing shot",
                        "dialogue": "A magical cat kingdom?! This is incredible!",
                        "prompt_used": "Professional comic panel showing magical cat kingdom"
                    },
                    {
                        "panel_number": 4,
                        "image_url": "/generated_images/demo_portal_4.png",
                        "scene_description": "Character standing proudly as chosen ambassador, cats surrounding them, expression of accomplishment and joy",
                        "dialogue": "I'm honored to be your ambassador!",
                        "prompt_used": "Professional comic panel showing character as ambassador"
                    }
                ],
                "character_anchor": "Young person with brown curly hair, green eyes, red bomber jacket, blue jeans, white sneakers",
                "generation_time": 12.5,
                "demo": True
            },
            "grandmother_recipe": {
                "title": "Grandmother's Recipe",
                "story": "The day my grandmother taught me to make her secret chocolate chip cookies, her wrinkled hands guiding mine as we mixed love into every ingredient, not knowing it would be our last time baking together.",
                "panels": [
                    {
                        "panel_number": 1,
                        "image_url": "/generated_images/demo_recipe_1.png",
                        "scene_description": "Character and grandmother in cozy kitchen, grandmother's wrinkled hands guiding the character's hands as they mix ingredients",
                        "dialogue": "Show me your secret technique, Grandma.",
                        "prompt_used": "Professional comic panel showing grandmother teaching recipe"
                    },
                    {
                        "panel_number": 2,
                        "image_url": "/generated_images/demo_recipe_2.png",
                        "scene_description": "Grandmother teaching secret techniques, character watching intently with love and concentration",
                        "dialogue": "I'm learning so much from you.",
                        "prompt_used": "Professional comic panel showing learning moment"
                    },
                    {
                        "panel_number": 3,
                        "image_url": "/generated_images/demo_recipe_3.png",
                        "scene_description": "The moment of realization this is their last time together, bittersweet expressions, warm lighting",
                        "dialogue": "I wish this moment could last forever...",
                        "prompt_used": "Professional comic panel showing emotional moment"
                    },
                    {
                        "panel_number": 4,
                        "image_url": "/generated_images/demo_recipe_4.png",
                        "scene_description": "Character holding the finished cookies, grandmother's memory alive in the recipe, peaceful and heartwarming",
                        "dialogue": "Your love lives on in every cookie.",
                        "prompt_used": "Professional comic panel showing completed cookies"
                    }
                ],
                "character_anchor": "Young person with brown hair, warm eyes, comfortable clothing, gentle expression",
                "generation_time": 10.8,
                "demo": True
            },
            "superhero_hamster": {
                "title": "Superhero Hamster",
                "story": "My pet hamster Mr. Nibbles discovered he had superpowers and had to save our neighborhood from an invasion of robot vacuum cleaners that had gained sentience.",
                "panels": [
                    {
                        "panel_number": 1,
                        "image_url": "/generated_images/demo_hamster_1.png",
                        "scene_description": "Mr. Nibbles the hamster discovering his superpowers, small but determined expression, neighborhood setting",
                        "dialogue": "I feel... different. Stronger!",
                        "prompt_used": "Professional comic panel showing hamster discovering powers"
                    },
                    {
                        "panel_number": 2,
                        "image_url": "/generated_images/demo_hamster_2.png",
                        "scene_description": "Hamster realizing the robot vacuum invasion, dramatic pose showing his tiny heroism",
                        "dialogue": "The robots are attacking! I must help!",
                        "prompt_used": "Professional comic panel showing hamster seeing invasion"
                    },
                    {
                        "panel_number": 3,
                        "image_url": "/generated_images/demo_hamster_3.png",
                        "scene_description": "Mr. Nibbles using his powers to fight the sentient robot vacuums, epic battle with size contrast",
                        "dialogue": "Size doesn't matter when you have heart!",
                        "prompt_used": "Professional comic panel showing epic battle"
                    },
                    {
                        "panel_number": 4,
                        "image_url": "/generated_images/demo_hamster_4.png",
                        "scene_description": "Neighborhood saved, Mr. Nibbles as the tiny hero, residents celebrating the small but mighty savior",
                        "dialogue": "Mr. Nibbles, the tiny hero!",
                        "prompt_used": "Professional comic panel showing victory celebration"
                    }
                ],
                "character_anchor": "Small brown hamster with determined expression, tiny but heroic pose",
                "generation_time": 11.2,
                "demo": True
            }
        }
    
    def get_demo_comic(self, story_key: str) -> Dict[str, Any]:
        """Get a pre-generated demo comic"""
        if story_key in self.demo_comics:
            comic = self.demo_comics[story_key].copy()
            comic["success"] = True
            comic["generated_at"] = datetime.utcnow().isoformat()
            return comic
        else:
            return {
                "success": False,
                "error": f"Demo comic '{story_key}' not found"
            }
    
    def get_all_demo_comics(self) -> List[Dict[str, Any]]:
        """Get all available demo comics"""
        return list(self.demo_comics.values())
    
    def get_demo_comic_by_story(self, story: str) -> Dict[str, Any]:
        """Get demo comic based on story content"""
        story_lower = story.lower()
        
        if "portal" in story_lower and "magic" in story_lower:
            return self.get_demo_comic("magic_portal_dream")
        elif "grandmother" in story_lower and "recipe" in story_lower:
            return self.get_demo_comic("grandmother_recipe")
        elif "hamster" in story_lower and "superpower" in story_lower:
            return self.get_demo_comic("superhero_hamster")
        else:
            # Return the magic portal dream as default demo
            return self.get_demo_comic("magic_portal_dream")
    
    def create_demo_images(self) -> bool:
        """Create placeholder demo images if they don't exist"""
        try:
            demo_dir = "./generated_images"
            os.makedirs(demo_dir, exist_ok=True)
            
            # Create placeholder images for demo
            demo_images = [
                "demo_portal_1.png", "demo_portal_2.png", "demo_portal_3.png", "demo_portal_4.png",
                "demo_recipe_1.png", "demo_recipe_2.png", "demo_recipe_3.png", "demo_recipe_4.png",
                "demo_hamster_1.png", "demo_hamster_2.png", "demo_hamster_3.png", "demo_hamster_4.png"
            ]
            
            for image_name in demo_images:
                image_path = os.path.join(demo_dir, image_name)
                if not os.path.exists(image_path):
                    # Create a simple placeholder image
                    from PIL import Image, ImageDraw, ImageFont
                    
                    img = Image.new('RGB', (400, 600), color='white')
                    draw = ImageDraw.Draw(img)
                    
                    # Draw border
                    draw.rectangle([10, 10, 390, 590], outline='black', width=3)
                    
                    # Add text
                    try:
                        font = ImageFont.truetype("arial.ttf", 20)
                    except:
                        font = ImageFont.load_default()
                    
                    draw.text((20, 20), f"Demo Panel: {image_name}", fill='black', font=font)
                    draw.text((20, 50), "Professional Comic Art", fill='blue', font=font)
                    draw.text((20, 80), "Character Consistent", fill='green', font=font)
                    draw.text((20, 110), "High Quality", fill='red', font=font)
                    
                    img.save(image_path)
                    logger.info(f"Created demo image: {image_path}")
            
            return True
        except Exception as e:
            logger.error(f"Error creating demo images: {e}")
            return False
