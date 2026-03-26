import Dexie, { type EntityTable } from 'dexie'

// Types
export type GameSystem = 'dnd5e' | 'coc7e' | 'pathfinder2e' | 'custom'

export interface World {
  id: string
  name: string
  description: string
  system: GameSystem
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
  
  // Personality
  personality: string[]
  speechPattern: string
  greeting: string
  backstory: string
  
  // State
  disposition: number
  isAlive: boolean
  locationId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CharacterRelationship {
  id: string
  worldId: string
  sourceCharacterId: string
  targetCharacterId: string
  relationType: string
  label?: string
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
  role: 'user' | 'character'
  content: string
  createdAt: Date
}

export interface Settings {
  id: string
  openaiApiKey?: string
  model?: string
}

// Database
export type DungeonChatDB = Dexie & {
  worlds: EntityTable<World, 'id'>
  characters: EntityTable<Character, 'id'>
  relationships: EntityTable<CharacterRelationship, 'id'>
  memories: EntityTable<MemoryEntry, 'id'>
  messages: EntityTable<ConversationMessage, 'id'>
  settings: EntityTable<Settings, 'id'>
}

const db = new Dexie('dungeon-chat') as DungeonChatDB

db.version(1).stores({
  worlds: '@id, name',
  characters: '@id, worldId, name, [worldId+name]',
  relationships: '@id, worldId, sourceCharacterId, targetCharacterId, [worldId+sourceCharacterId]',
  memories: '@id, characterId, worldId, [characterId+createdAt]',
  messages: '@id, characterId, worldId, [characterId+createdAt]',
  settings: '@id',
})

export { db }

// ID Generator
export function generateId(): string {
  return crypto.randomUUID()
}

// Seed demo data
export async function seedDemoData() {
  const worldId = generateId()
  
  // Create demo world
  await db.worlds.add({
    id: worldId,
    name: 'The Kingdom of Eldoria',
    description: 'A medieval fantasy realm with ancient magic and political intrigue.',
    system: 'dnd5e',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // Create characters
  const characters: Character[] = [
    {
      id: generateId(),
      worldId,
      name: 'Gareth Ironforge',
      title: 'Tavern Keeper',
      avatar: '🍺',
      color: '#e67e22',
      personality: ['jovial', 'greedy', 'warm', 'gossip'],
      speechPattern: 'Speaks in a hearty, jolly manner, often breaking into laughter. Uses "ye" and "yer" instead of "you" and "your".',
      greeting: 'Hail, traveler! Welcome to the Rusty Dragon! What brings ye to my establishment?',
      backstory: 'Gareth is a middle-aged dwarf who has run the most popular tavern in the capital for 30 years. He knows every secret that passes through his doors and trades information as readily as ale. His only passion besides gossip is gold.',
      disposition: 10,
      isAlive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      worldId,
      name: 'Zephyrus the Wise',
      title: 'Court Wizard',
      avatar: '🔮',
      color: '#9b59b6',
      personality: ['mysterious', 'wise', 'riddle', 'aloof'],
      speechPattern: 'Speaks in riddles and metaphors, often pausing dramatically. References ancient lore and the threads of fate.',
      greeting: 'Ahh... another seeker approaches. The threads of fate intertwine... What do you wish to know, young one?',
      backstory: 'Zephyrus is an ancient wizard who has served three generations of kings. He knows more than he reveals, and his prophecies are both feared and sought. He rarely leaves his tower unless the realm faces existential threat.',
      disposition: 0,
      isAlive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      worldId,
      name: 'Marcus Thornwood',
      title: 'Captain of the Guard',
      avatar: '🛡️',
      color: '#3498db',
      personality: ['honorable', 'strict', 'suspicious', 'duty-bound'],
      speechPattern: 'Speaks formally and directly, addressing people by their titles. Always considers legal implications.',
      greeting: 'Halt! State your business, citizen. The city guard has no patience for troublemakers or those with ill intentions.',
      backstory: 'Marcus rose through the ranks of the city guard over 20 years. He believes strongly in law and order and views adventurers as necessary evils that must be monitored. His loyalty to the crown is absolute.',
      disposition: -10,
      isAlive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      worldId,
      name: 'Pip Snapfinger',
      title: 'Street Urchin',
      avatar: '🐀',
      color: '#27ae60',
      personality: ['quick-witted', 'street-smart', 'loyal', 'mischievous'],
      speechPattern: 'Speaks fast and uses slang. References survival, money, and street smarts. Calls everyone "mate".',
      greeting: "Oi! Lookee here, a fancy pants! Pip's the name, survival's the game. You need something, I know where to get it, cheap!",
      backstory: 'Pip is an orphan who grew up on the streets and now leads a small gang of urchins. They know every back alley, black market contact, and secret in the city. Despite the tough exterior, Pip is fiercely loyal to friends.',
      disposition: 20,
      isAlive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      worldId,
      name: 'Lady Isolde Ashford',
      title: 'Noble Lady',
      avatar: '👸',
      color: '#e91e63',
      personality: ['refined', 'calculating', 'secretive', 'ambitious'],
      speechPattern: 'Speaks with elegance and precision, using complex sentences. Often makes subtle veiled remarks.',
      greeting: 'How delightfully... unexpected. Do sit. I was just contemplating matters of great tedium. Perhaps you might prove more amusing.',
      backstory: 'Lady Isolde is a powerful noblewoman from one of the oldest families in the kingdom. She plays the game of politics masterfully, always three moves ahead. She has dark secrets buried in her family history.',
      disposition: 0,
      isAlive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      worldId,
      name: 'Bronn Blackwater',
      title: 'Sellsword',
      avatar: '⚔️',
      color: '#c0392b',
      personality: ['pragmatic', 'cynical', 'violent', 'honorable-to-a-fault'],
      speechPattern: 'Speaks bluntly, often about money, violence, or survival. Uses crude language but keeps his word.',
      greeting: "You want muscle? I'm your man. Copper on the line, I break skulls. Gold in your pocket, I take jobs. So... what's it gonna be?",
      backstory: 'Bronn is a veteran mercenary who has fought in every war for the past decade. He works for whoever pays, but he never betrays a contract or harms civilians. He is saving money to buy a farm far from conflict.',
      disposition: 0,
      isAlive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  await db.characters.bulkAdd(characters)

  // Create relationships
  const [gareth, zephyrus, marcus, pip, isolde, bronn] = characters

  const relationships: CharacterRelationship[] = [
    {
      id: generateId(),
      worldId,
      sourceCharacterId: gareth.id,
      targetCharacterId: pip.id,
      relationType: 'guardian',
      label: 'Protects the urchins',
      strength: 60,
      isSecret: false,
      description: 'Gareth secretly funds Pip\'s gang and provides food for the street children. In return, Pip brings him juicy gossip.',
    },
    {
      id: generateId(),
      worldId,
      sourceCharacterId: marcus.id,
      targetCharacterId: pip.id,
      relationType: 'enemy',
      label: 'Pursues aggressively',
      strength: 70,
      isSecret: false,
      description: 'Marcus has been trying to catch Pip for years. The urchins always slip away thanks to their network of informants.',
    },
    {
      id: generateId(),
      worldId,
      sourceCharacterId: gareth.id,
      targetCharacterId: zephyrus.id,
      relationType: 'friends',
      label: 'Old drinking buddies',
      strength: 50,
      isSecret: false,
      description: 'They met decades ago when Zephyrus was still a young apprentice. Gareth has been providing him with rare ingredients for his potions.',
    },
    {
      id: generateId(),
      worldId,
      sourceCharacterId: isolde.id,
      targetCharacterId: zephyrus.id,
      relationType: 'advisor',
      label: 'Royal advisor',
      strength: 40,
      isSecret: false,
      description: 'Zephyrus advises the royal family, which includes Isolde\'s political rivals. This creates tension.',
    },
    {
      id: generateId(),
      worldId,
      sourceCharacterId: bronn.id,
      targetCharacterId: gareth.id,
      relationType: 'regular',
      label: 'Best customer',
      strength: 80,
      isSecret: false,
      description: 'Bronn drinks at the Rusty Dragon every night. Gareth knows to keep Bronn\'s table stocked and his mouth shut about what he hears.',
    },
    {
      id: generateId(),
      worldId,
      sourceCharacterId: isolde.id,
      targetCharacterId: bronn.id,
      relationType: 'employer',
      label: 'Occasional employer',
      strength: 30,
      isSecret: false,
      description: 'Isolde has hired Bronn for "special tasks" that require muscle and discretion. She pays well but asks no questions.',
    },
  ]

  await db.relationships.bulkAdd(relationships)

  return worldId
}
