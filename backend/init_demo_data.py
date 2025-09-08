#!/usr/bin/env python3
"""
Initialize demo data for hackathon presentation
Run this script to preload sample stories and optimize for demo
"""

import asyncio
import logging
from services.api_optimizer import APIOptimizer
from services.sequential_comic_generator import SequentialComicGenerator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def initialize_demo_data():
    """Initialize demo data for hackathon presentation"""
    
    logger.info("🚀 Initializing OtakuCanvas for Nano Banana Hackathon...")
    
    # Initialize services
    api_optimizer = APIOptimizer()
    comic_generator = SequentialComicGenerator()
    
    # Preload sample stories for instant demo access
    logger.info("📚 Preloading sample stories for instant demo access...")
    api_optimizer.preload_sample_stories()
    
    # Test API connection
    logger.info("🔗 Testing API connections...")
    try:
        # Test with a simple story
        test_story = "I found a magic portal in my backyard."
        result = await api_optimizer.optimized_generate(test_story)
        
        if result.get("success"):
            logger.info("✅ API connection successful")
        else:
            logger.warning("⚠️ API connection issues - will use cached samples")
            
    except Exception as e:
        logger.warning(f"⚠️ API test failed: {e} - will use cached samples")
    
    # Display usage stats
    stats = api_optimizer.get_usage_stats()
    logger.info(f"📊 Current API usage: {stats['current_usage']}/{stats['daily_limit']}")
    logger.info(f"💾 Cached results: {stats['cached_results']}")
    
    logger.info("🎯 OtakuCanvas is ready for hackathon demo!")
    logger.info("🎨 Demo stories available for instant generation")
    logger.info("📈 Performance tracking enabled")
    logger.info("💾 Smart caching active")
    
    return True

if __name__ == "__main__":
    asyncio.run(initialize_demo_data())
