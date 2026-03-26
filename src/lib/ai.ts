let apiKey: string | null = null
const baseURL = 'https://openrouter.ai/api/v1'

export function initOpenAI(key: string) {
  apiKey = key
}

export function hasOpenAI(): boolean {
  return apiKey !== null && apiKey.length > 0
}

export function getAPIKey(): string | null {
  return apiKey
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function sendMessage(
  characterContext: string,
  message: string,
  conversationHistory: { role: 'user' | 'character'; content: string }[],
  model: string = 'anthropic/claude-3-haiku'
): Promise<string> {
  if (!apiKey) {
    throw new Error('API not configured. Please set your API key in settings.')
  }

  const systemPrompt = `${characterContext}

STAY IN CHARACTER at all times. Never break character. Never use markdown. Keep responses to 1-3 paragraphs max.`

  const chatMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: message },
  ]

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: chatMessages,
      max_tokens: 500,
      temperature: 0.8,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  
  if (!content) {
    throw new Error('No response from AI')
  }
  
  return content
}

export async function extractMemory(
  conversation: { role: 'user' | 'character'; content: string }[],
  model: string = 'anthropic/claude-3-haiku'
): Promise<string | null> {
  if (!apiKey || conversation.length < 2) return null

  const lastMessages = conversation.slice(-6)
  
  const systemPrompt = `Extract a brief memory (1-2 sentences) that this character should remember from the user's messages. If nothing important happened, respond with exactly "NONE".`

  const userMessages = lastMessages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n')

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User messages:\n${userMessages}` },
      ],
      max_tokens: 100,
      temperature: 0.3,
    }),
  })

  if (!response.ok) return null

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || null
}

export async function testConnection(key: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10,
      }),
    })
    return response.ok
  } catch {
    return false
  }
}

// Helper to build character context string for AI
export function buildCharacterContext(
  character: { name: string; title: string; personality: string[]; disposition: number; backstory: string; speechPattern: string },
  relationships: { targetName: string; relationType: string; label?: string; description: string }[],
  memories: { content: string }[]
): string {
  const dispositionText = character.disposition > 0 
    ? `Friendly (${character.disposition}/100)` 
    : character.disposition < 0 
      ? `Hostile (${character.disposition}/100)` 
      : `Neutral (${character.disposition}/100)`

  const relationshipText = relationships.length > 0
    ? relationships.map(r => `- ${r.targetName} (${r.relationType}${r.label ? `: ${r.label}` : ''}): ${r.description}`).join('\n')
    : 'No known relationships.'

  const memoryText = memories.length > 0
    ? memories.slice(0, 5).map(m => `- ${m.content}`).join('\n')
    : 'No memories yet.'

  return `
Profile: ${character.name}, ${character.title}
Personality: ${character.personality.join(', ')}
Disposition: ${dispositionText}

Background: ${character.backstory}

Speech Style: ${character.speechPattern}

Known Relationships:
${relationshipText}

Recent Memories:
${memoryText}
`
}
