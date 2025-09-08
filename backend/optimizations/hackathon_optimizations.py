"""
Hackathon-specific optimizations for OtakuCanvas
Designed for Kaggle Nano Banana Hackathon performance and demo readiness
"""

import asyncio
import time
import logging
from typing import Dict, List, Any
from functools import lru_cache
import json

logger = logging.getLogger(__name__)

class HackathonOptimizer:
    """Optimizations specifically for hackathon demo and performance"""
    
    def __init__(self):
        self.generation_cache = {}
        self.performance_metrics = {
            'total_generations': 0,
            'avg_generation_time': 0,
            'cache_hits': 0,
            'error_rate': 0
        }
    
    @lru_cache(maxsize=100)
    def get_optimized_prompt(self, base_prompt: str, style: str) -> str:
        """Cache optimized prompts for faster generation"""
        # Pre-optimized prompts for common scenarios
        prompt_templates = {
            'manga': {
                'action': f"{base_prompt}, dynamic action pose, dramatic lighting, manga art style, clean line art, high contrast",
                'dialogue': f"{base_prompt}, character close-up, expressive face, speech bubble space, manga art style",
                'establishing': f"{base_prompt}, wide shot, environmental details, atmospheric lighting, manga art style"
            },
            'manhwa': {
                'action': f"{base_prompt}, vibrant colors, webtoon style, dynamic composition, modern Korean comic art",
                'dialogue': f"{base_prompt}, character portrait, emotional expression, clean background, manhwa style",
                'establishing': f"{base_prompt}, vertical composition, detailed environment, colorful palette, webtoon format"
            },
            'western_comic': {
                'action': f"{base_prompt}, bold colors, superhero style, dynamic poses, American comic book art",
                'dialogue': f"{base_prompt}, character headshot, dramatic expression, comic book style",
                'establishing': f"{base_prompt}, wide establishing shot, detailed background, comic book art style"
            }
        }
        
        # Determine prompt type based on keywords
        if any(word in base_prompt.lower() for word in ['fight', 'battle', 'action', 'attack']):
            prompt_type = 'action'
        elif any(word in base_prompt.lower() for word in ['talk', 'speak', 'dialogue', 'conversation']):
            prompt_type = 'dialogue'
        else:
            prompt_type = 'establishing'
        
        return prompt_templates.get(style, prompt_templates['manga']).get(prompt_type, base_prompt)
    
    async def batch_generate_panels(self, panel_prompts: List[str], character_anchors: Dict[str, str], style: str) -> List[Dict[str, Any]]:
        """Optimized batch generation for hackathon demo"""
        start_time = time.time()
        
        # Use asyncio.gather for concurrent generation
        tasks = []
        for i, prompt in enumerate(panel_prompts):
            optimized_prompt = self.get_optimized_prompt(prompt, style)
            task = self._generate_single_panel_optimized(optimized_prompt, character_anchors, style, i)
            tasks.append(task)
        
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results and handle errors
            processed_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Panel {i} generation failed: {result}")
                    processed_results.append({
                        'panel_index': i,
                        'image_url': f"https://via.placeholder.com/800x600/000000/FFFFFF?text=Error+Panel+{i+1}",
                        'success': False,
                        'error': str(result)
                    })
                else:
                    processed_results.append(result)
            
            # Update performance metrics
            generation_time = time.time() - start_time
            self._update_metrics(generation_time, len(panel_prompts))
            
            return processed_results
            
        except Exception as e:
            logger.error(f"Batch generation failed: {e}")
            # Return fallback results
            return [{
                'panel_index': i,
                'image_url': f"https://via.placeholder.com/800x600/000000/FFFFFF?text=Fallback+Panel+{i+1}",
                'success': False,
                'error': str(e)
            } for i in range(len(panel_prompts))]
    
    async def _generate_single_panel_optimized(self, prompt: str, character_anchors: Dict[str, str], style: str, index: int) -> Dict[str, Any]:
        """Optimized single panel generation with caching"""
        
        # Check cache first
        cache_key = f"{hash(prompt)}_{style}_{index}"
        if cache_key in self.generation_cache:
            self.performance_metrics['cache_hits'] += 1
            return self.generation_cache[cache_key]
        
        # Simulate optimized generation (replace with actual Imagen API call)
        await asyncio.sleep(0.5)  # Simulated generation time
        
        result = {
            'panel_index': index,
            'image_url': f"https://via.placeholder.com/800x600/000000/FFFFFF?text=Optimized+Panel+{index+1}",
            'prompt_used': prompt,
            'success': True,
            'generation_time': 0.5
        }
        
        # Cache the result
        self.generation_cache[cache_key] = result
        return result
    
    def _update_metrics(self, generation_time: float, panel_count: int):
        """Update performance metrics for hackathon monitoring"""
        self.performance_metrics['total_generations'] += panel_count
        self.performance_metrics['avg_generation_time'] = (
            (self.performance_metrics['avg_generation_time'] * (self.performance_metrics['total_generations'] - panel_count) + generation_time) 
            / self.performance_metrics['total_generations']
        )
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary for hackathon demo"""
        return {
            'total_generations': self.performance_metrics['total_generations'],
            'average_generation_time': round(self.performance_metrics['avg_generation_time'], 2),
            'cache_hit_rate': round(
                self.performance_metrics['cache_hits'] / max(self.performance_metrics['total_generations'], 1) * 100, 2
            ),
            'error_rate': round(self.performance_metrics['error_rate'], 2),
            'optimization_status': 'ACTIVE'
        }
    
    def get_demo_scenarios(self) -> List[Dict[str, Any]]:
        """Pre-defined demo scenarios for hackathon presentation"""
        return [
            {
                'name': 'Action Scene',
                'description': 'Dramatic battle between hero and villain',
                'prompt': 'A heroic warrior in a red jacket faces off against a menacing dark sorcerer in a mystical forest clearing',
                'style': 'manga',
                'expected_panels': 3,
                'demo_time': '30 seconds'
            },
            {
                'name': 'Dialogue Scene',
                'description': 'Character conversation with emotional depth',
                'prompt': 'Two friends having a heartfelt conversation on a rooftop at sunset',
                'style': 'manhwa',
                'expected_panels': 2,
                'demo_time': '20 seconds'
            },
            {
                'name': 'Establishing Shot',
                'description': 'World-building and atmosphere',
                'prompt': 'A futuristic cityscape with flying cars and neon lights at night',
                'style': 'western_comic',
                'expected_panels': 1,
                'demo_time': '15 seconds'
            }
        ]
    
    def generate_demo_script(self) -> str:
        """Generate demo script for hackathon presentation"""
        return """
        # OtakuCanvas Demo Script - Kaggle Nano Banana Hackathon
        
        ## Opening (30 seconds)
        "Welcome to OtakuCanvas, an AI-powered manga creator that uses Google's Vertex AI 
        and Imagen models to generate consistent, high-quality comic panels with character 
        continuity and storytelling accuracy."
        
        ## Character Creation Demo (60 seconds)
        1. Show character creation wizard
        2. Create a hero character with traits
        3. Create a villain character
        4. Explain character anchoring system
        
        ## Scene Generation Demo (90 seconds)
        1. Select characters for scene
        2. Enter action scene prompt
        3. Show AI generation in real-time
        4. Demonstrate character consistency
        5. Show panel editing capabilities
        
        ## Advanced Features (60 seconds)
        1. Drag-drop panel editor
        2. Dialogue bubble editing
        3. Multiple export formats
        4. Story continuity tracking
        
        ## Technical Highlights (30 seconds)
        1. Google Vertex AI integration
        2. Scalable microservices architecture
        3. Character prompt anchoring
        4. Real-time performance metrics
        
        ## Closing (30 seconds)
        "OtakuCanvas demonstrates how AI can enhance creative workflows while maintaining 
        artistic consistency and storytelling quality. Built for creators, powered by Google AI."
        """

# Global optimizer instance
hackathon_optimizer = HackathonOptimizer()
