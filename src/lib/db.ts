// Re-export types for convenience
export type GameSystem = 'dnd5e' | 'coc7e' | 'pathfinder2e' | 'custom'

export interface World {
  id: string
  name: string
  description: string
  system: string
  createdAt: Date
  updatedAt: Date
}

export interface Character {
  id: string
  worldId: string
  name: string
  title: string
  avatar: string
  color: string
  personality: string
  speechPattern: string
  greeting: string
  backstory: string
  disposition: number
  isAlive: boolean
  locationId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CharacterRelationship {
  id: string
  worldId: string
  sourceCharacterId: string
  targetCharacterId: string
  relationType: string
  label?: string | null
  strength: number
  isSecret: boolean
  description: string
}

export interface MemoryEntry {
  id: string
  characterId: string
  worldId: string
  content: string
  relevance: number
  createdAt: Date
}

export interface ConversationMessage {
  id: string
  characterId: string
  worldId: string
  role: string
  content: string
  createdAt: Date
}

export interface Settings {
  id: string
  openaiApiKey?: string | null
  model: string
}

// For backward compatibility - seed function placeholder
export async function seedDemoData() {
  // Seed is now handled by the server API
  console.log('Seed is now handled by server API')
}
