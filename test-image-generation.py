#!/usr/bin/env python3
"""
Test script for OtakuCanvas image generation
"""
import asyncio
import sys
import os

# Add backend to path
sys.path.append('./backend')

from backend.services.sequential_comic_generator import SequentialComicGenerator

async def test_image_generation():
    print("🧪 Testing OtakuCanvas Image Generation...\n")
    
    # Initialize the generator
    generator = SequentialComicGenerator()
    
    # Test story
    test_story = "I dreamed I found a hidden portal in my backyard that led to a magical world where cats rule everything and I became their chosen human ambassador."
    
    print(f"📖 Test Story: {test_story[:50]}...")
    print(f"🔧 Demo Mode: {generator.use_demo_mode}")
    print()
    
    try:
        # Generate comic
        print("🎨 Generating 4-panel comic...")
        result = await generator.generate_comic_from_story(test_story)
        
        if result.get("success"):
            print("✅ Comic generation successful!")
            print(f"⏱️  Generation time: {result.get('generation_time', 0):.2f}s")
            print(f"📊 API calls used: {result.get('api_calls_used', 0)}")
            print(f"🎭 Character anchor: {result.get('character_anchor', 'N/A')[:50]}...")
            print()
            
            # Show panel details
            panels = result.get("panels", [])
            print(f"📋 Generated {len(panels)} panels:")
            for i, panel in enumerate(panels, 1):
                print(f"  Panel {i}: {panel.get('scene_description', 'N/A')[:60]}...")
                print(f"    Image: {panel.get('image_url', 'N/A')}")
                print(f"    Dialogue: {panel.get('dialogue', 'N/A')}")
                print()
            
            print("🎉 Image generation test completed successfully!")
            return True
            
        else:
            print("❌ Comic generation failed!")
            print(f"Error: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_image_generation())
    sys.exit(0 if success else 1)
