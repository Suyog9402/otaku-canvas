import hashlib
import logging
from typing import Dict, Optional
import json

from services.sequential_comic_generator import SequentialComicGenerator
from services.demo_comic_service import DemoComicService

logger = logging.getLogger(__name__)

class APIOptimizer:
    """Optimize API usage for hackathon demo reliability"""
    
    def __init__(self):
        self.daily_limit = 100
        self.current_usage = 0
        self.cached_results = {}
        self.sequential_comic_generator = SequentialComicGenerator()
        self.demo_service = DemoComicService()
    
    async def optimized_generate(self, story: str) -> Dict:
        """Generate with smart caching and usage tracking"""
        
        # Check cache first
        story_hash = hashlib.md5(story.encode()).hexdigest()
        cached_result = await self.sequential_comic_generator.get_cached_result(story_hash)
        if cached_result:
            logger.info(f"Using cached result for story hash: {story_hash[:8]}")
            return cached_result
        
        # Check API quota
        if self.current_usage >= self.daily_limit:
            logger.warning("API quota exceeded, returning demo comic")
            return self._fallback_to_demo(story)
        
        # Generate with usage tracking
        result = await self.sequential_comic_generator.generate_comic_from_story(story)
        self.current_usage += 4  # 4 panels = 4 API calls
        
        # Cache successful results
        if result.get("success"):
            self.sequential_comic_generator.cache_result(story_hash, result)
        
        return result
    
    def _fallback_to_demo(self, story: str) -> Dict:
        """Return demo comic when API quota exceeded or for demo mode"""
        logger.info(f"Using demo comic for story: {story[:50]}...")
        return self.demo_service.get_demo_comic_by_story(story)
    
    def get_usage_stats(self) -> Dict:
        """Get current usage statistics"""
        return {
            "current_usage": self.current_usage,
            "daily_limit": self.daily_limit,
            "remaining": self.daily_limit - self.current_usage,
            "cached_results": len(self.cached_results),
            "usage_percentage": (self.current_usage / self.daily_limit) * 100
        }
    
    def reset_daily_usage(self):
        """Reset daily usage counter (for testing)"""
        self.current_usage = 0
        logger.info("Daily usage counter reset")
    
    def preload_sample_stories(self):
        """Preload sample stories for instant demo access"""
        sample_stories = [
            "I dreamed I found a hidden portal in my backyard that led to a magical world where cats rule everything and I became their chosen human ambassador.",
            "The day my grandmother taught me to make her secret chocolate chip cookies, her wrinkled hands guiding mine as we mixed love into every ingredient, not knowing it would be our last time baking together.",
            "My pet hamster Mr. Nibbles discovered he had superpowers and had to save our neighborhood from an invasion of robot vacuum cleaners that had gained sentience."
        ]
        
        for story in sample_stories:
            story_hash = hashlib.md5(story.encode()).hexdigest()
            if story_hash not in self.cached_results:
                # Cache the fallback sample for instant access
                self.cached_results[story_hash] = self._fallback_to_samples()
        
        logger.info(f"Preloaded {len(sample_stories)} sample stories for instant demo access")
