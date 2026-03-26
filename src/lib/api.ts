const API_BASE = '/api'

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

// Worlds
export const api = {
  worlds: {
    list: () => fetchJSON<any[]>('/worlds'),
    get: (id: string) => fetchJSON<any>(`/worlds/${id}`),
    create: (data: any) => fetchJSON<any>('/worlds', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchJSON<any>(`/worlds/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<any>(`/worlds/${id}`, { method: 'DELETE' }),
  },

  characters: {
    list: (worldId: string) => fetchJSON<any[]>(`/worlds/${worldId}/characters`),
    get: (id: string) => fetchJSON<any>(`/characters/${id}`),
    create: (worldId: string, data: any) => fetchJSON<any>(`/worlds/${worldId}/characters`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchJSON<any>(`/characters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<any>(`/characters/${id}`, { method: 'DELETE' }),
    messages: (id: string) => fetchJSON<any[]>(`/characters/${id}/messages`),
    addMessage: (id: string, data: any) => fetchJSON<any>(`/characters/${id}/messages`, { method: 'POST', body: JSON.stringify(data) }),
    clearMessages: (id: string) => fetchJSON<any>(`/characters/${id}/messages`, { method: 'DELETE' }),
    memories: (id: string) => fetchJSON<any[]>(`/characters/${id}/memories`),
    addMemory: (id: string, data: any) => fetchJSON<any>(`/characters/${id}/memories`, { method: 'POST', body: JSON.stringify(data) }),
  },

  relationships: {
    list: (worldId: string) => fetchJSON<any[]>(`/worlds/${worldId}/relationships`),
    create: (worldId: string, data: any) => fetchJSON<any>(`/worlds/${worldId}/relationships`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchJSON<any>(`/relationships/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<any>(`/relationships/${id}`, { method: 'DELETE' }),
  },

  memories: {
    delete: (id: string) => fetchJSON<any>(`/memories/${id}`, { method: 'DELETE' }),
  },

  settings: {
    get: () => fetchJSON<any>('/settings'),
    update: (data: any) => fetchJSON<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },

  seed: () => fetchJSON<any>('/seed', { method: 'POST' }),
}

// Helper to parse character personality JSON
export function parsePersonality(personalityJson: string): string[] {
  try {
    return JSON.parse(personalityJson)
  } catch {
    return []
  }
}
