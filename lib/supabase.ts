import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string
          name: string
          description: string
          archetype: string
          style: string
          traits: string[]
          appearance: Record<string, any>
          personality: Record<string, any>
          backstory: string | null
          image_url: string | null
          prompt_anchor: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          archetype: string
          style: string
          traits?: string[]
          appearance?: Record<string, any>
          personality?: Record<string, any>
          backstory?: string | null
          image_url?: string | null
          prompt_anchor: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          archetype?: string
          style?: string
          traits?: string[]
          appearance?: Record<string, any>
          personality?: Record<string, any>
          backstory?: string | null
          image_url?: string | null
          prompt_anchor?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      scenes: {
        Row: {
          id: string
          prompt: string
          character_ids: string[]
          style: string
          layout: string
          panels: Record<string, any>[]
          previous_scene_context: string | null
          next_scene_hint: string | null
          user_id: string
          created_at: string
          updated_at: string
          story_continuity_score: number
        }
        Insert: {
          id?: string
          prompt: string
          character_ids: string[]
          style: string
          layout: string
          panels?: Record<string, any>[]
          previous_scene_context?: string | null
          next_scene_hint?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
          story_continuity_score?: number
        }
        Update: {
          id?: string
          prompt?: string
          character_ids?: string[]
          style?: string
          layout?: string
          panels?: Record<string, any>[]
          previous_scene_context?: string | null
          next_scene_hint?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
          story_continuity_score?: number
        }
      }
      stories: {
        Row: {
          id: string
          title: string
          description: string | null
          user_id: string
          style: string
          created_at: string
          updated_at: string
          total_pages: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          user_id: string
          style?: string
          created_at?: string
          updated_at?: string
          total_pages?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          user_id?: string
          style?: string
          created_at?: string
          updated_at?: string
          total_pages?: number
        }
      }
      chapters: {
        Row: {
          id: string
          story_id: string
          title: string
          description: string | null
          chapter_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          story_id: string
          title: string
          description?: string | null
          chapter_number: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          title?: string
          description?: string | null
          chapter_number?: number
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          chapter_id: string
          scene_id: string
          page_number: number
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          scene_id: string
          page_number: number
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chapter_id?: string
          scene_id?: string
          page_number?: number
          title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
