import OpenAI from 'openai'
import { db, type Character } from './db'

let openai: OpenAI | null = null

export function initOpenAI(apiKey: string) {
  openai = new OpenAI({ apiKey })
}

export function hasOpenAI(): boolean {
  return openai !== null
}

async function getCharacterContext(character: Character, worldId: string): Promise<string> {
  const memories = await db.memories
    .where('characterId')
    .equals(character.id)
    .reverse()
    .sortBy('createdAt')
  
  const relationships = await db.relationships
    .where('worldId')
    .equals(worldId)
    .filter(r => r.sourceCharacterId === character.id || r.targetCharacterId === character.id)
    .toArray()

  const relationshipDescriptions: string[] = []
  for (const rel of relationships) {
    const isSource = rel.sourceCharacterId === character.id
    const otherId = isSource ? rel.targetCharacterId : rel.sourceCharacterId
    const otherChar = await db.characters.get(otherId)
    if (!otherChar) continue
    
    const direction = isSource ? '->' : '<-'
    const label = rel.label ? `: ${rel.label}` : ''
    relationshipDescriptions.push(`${direction} ${otherChar.name} (${rel.relationType}${label}): ${rel.description}`)
  }

  const relationshipText = relationshipDescriptions.join('\n')
  const memoryText = memories.length > 0 
    ? memories.slice(0, 5).map(m => `- ${m.content}`).join('\n')
    : 'No memories yet.'

  const dispositionText = character.disposition > 0 
    ? `Friendly (${character.disposition}/100)` 
    : character.disposition < 0 
      ? `Hostile (${character.disposition}/100)` 
      : `Neutral (${character.disposition}/100)`

  return `
Profile: ${character.name}, ${character.title}
Personality: ${character.personality.join(', ')}
Disposition: ${dispositionText}

Background: ${character.backstory}

Speech Style: ${character.speechPattern}

Known Relationships:
${relationshipText || 'No known relationships.'}

Recent Memories:
${memoryText}
`
}

export async function sendMessage(
  character: Character,
  worldId: string,
  message: string,
  conversationHistory: { role: 'user' | 'character'; content: string }[]
): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI not configured. Please set your API key in settings.')
  }

  const context = await getCharacterContext(character, worldId)
  
  const personalityList = character.personality.join(', ')
  
  const systemPrompt = `You are ${character.name}, ${character.title} from a tabletop RPG.

${context}

STAY IN CHARACTER at all times. You are ${character.name}, not an AI.
Personality traits: ${personalityList}
Speech: ${character.speechPattern}
Never break character. Never use markdown. Keep responses to 1-3 paragraphs max.`

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: message },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 500,
    temperature: 0.8,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from AI')
  }
  
  return content
}

export async function extractMemory(
  character: Character,
  worldId: string,
  conversation: { role: 'user' | 'character'; content: string }[]
): Promise<string | null> {
  if (!openai || conversation.length < 2) return null

  const lastMessages = conversation.slice(-6)
  
  const systemPrompt = `Extract a brief memory (1-2 sentences) that ${character.name} should remember from this conversation. If nothing important happened, respond with exactly "NONE".`

  const userMessages = lastMessages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Conversation:\n${userMessages}` },
    ],
    max_tokens: 100,
    temperature: 0.3,
  })

  const memory = response.choices[0]?.message?.content?.trim()
  
  if (memory === 'NONE' || !memory) return null
  
  await db.memories.add({
    id: crypto.randomUUID(),
    characterId: character.id,
    worldId,
    content: memory,
    relevance: 7,
    createdAt: new Date(),
  })

  return memory
}
