import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate } from '@tanstack/react-router'
import { db } from '../lib/db'
import { MessageCircle, Network, Plus, ArrowLeft, Trash2 } from 'lucide-react'

export default function WorldDetailPage() {
  const { worldId } = useParams({ from: '/worlds/$worldId' })
  const navigate = useNavigate()
  
  const world = useLiveQuery(() => db.worlds.get(worldId), [worldId])
  const characters = useLiveQuery(
    () => db.characters.where('worldId').equals(worldId).toArray(),
    [worldId]
  )
  const relationshipCount = useLiveQuery(
    () => db.relationships.where('worldId').equals(worldId).count(),
    [worldId]
  )

  const handleCreateCharacter = async () => {
    const id = crypto.randomUUID()
    await db.characters.add({
      id,
      worldId,
      name: 'New Character',
      title: '',
      avatar: '👤',
      color: '#888888',
      personality: [],
      speechPattern: '',
      greeting: 'Hello there...',
      backstory: '',
      disposition: 0,
      isAlive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    navigate({ to: '/worlds/$worldId/characters/$characterId', params: { worldId, characterId: id } })
  }

  const handleDeleteWorld = async () => {
    if (!confirm('Delete this world and all its characters? This cannot be undone.')) return
    
    // Delete all related data
    const chars = await db.characters.where('worldId').equals(worldId).toArray()
    for (const char of chars) {
      await db.memories.where('characterId').equals(char.id).delete()
      await db.messages.where('characterId').equals(char.id).delete()
    }
    await db.characters.where('worldId').equals(worldId).delete()
    await db.relationships.where('worldId').equals(worldId).delete()
    await db.worlds.delete(worldId)
    
    navigate({ to: '/worlds' })
  }

  if (!world) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Header */}
      <header className="border-b border-[#1e1e3f] px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate({ to: '/worlds' })}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Worlds
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <h1 className="text-xl font-bold">{world.name}</h1>
                <p className="text-xs text-gray-500">{world.description}</p>
              </div>
            </div>
            <button
              onClick={handleDeleteWorld}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
              title="Delete World"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#16213e] rounded-xl p-4 border border-[#0f3460]">
            <div className="text-3xl font-bold text-[#e94560]">{characters?.length ?? 0}</div>
            <div className="text-sm text-gray-400">Characters</div>
          </div>
          <div className="bg-[#16213e] rounded-xl p-4 border border-[#0f3460]">
            <div className="text-3xl font-bold text-[#3498db]">{relationshipCount ?? 0}</div>
            <div className="text-sm text-gray-400">Relationships</div>
          </div>
          <div className="bg-[#16213e] rounded-xl p-4 border border-[#0f3460]">
            <div className="text-3xl font-bold text-[#27ae60]">{world.system.toUpperCase()}</div>
            <div className="text-sm text-gray-400">System</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleCreateCharacter}
            className="flex-1 p-4 bg-[#16213e] hover:bg-[#1a2744] rounded-xl border border-[#0f3460] hover:border-[#e94560] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Character
          </button>
          <button
            onClick={() => navigate({ to: '/worlds/$worldId/relationships', params: { worldId } })}
            className="flex-1 p-4 bg-[#16213e] hover:bg-[#1a2744] rounded-xl border border-[#0f3460] hover:border-[#9b59b6] transition-all flex items-center justify-center gap-2"
          >
            <Network className="w-5 h-5" />
            View Relationships
          </button>
        </div>

        {/* Characters */}
        <h2 className="text-xl font-semibold mb-4">Characters</h2>
        {characters?.length === 0 ? (
          <div className="text-center py-12 bg-[#16213e] rounded-xl border border-[#0f3460]">
            <div className="text-5xl mb-4">👤</div>
            <p className="text-gray-400">No characters yet. Create your first character!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {characters?.map((char) => (
              <button
                key={char.id}
                onClick={() => navigate({ to: '/worlds/$worldId/characters/$characterId', params: { worldId, characterId: char.id } })}
                className="w-full text-left p-4 bg-[#16213e] hover:bg-[#1a2744] rounded-xl border border-[#0f3460] hover:border-[#e94560] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: char.color + '33' }}
                    >
                      {char.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{char.name}</h3>
                        {!char.isAlive && (
                          <span className="text-xs px-2 py-0.5 bg-red-900/50 text-red-300 rounded">Deceased</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{char.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {char.personality.slice(0, 3).map(p => (
                          <span key={p} className="text-xs px-2 py-0.5 bg-[#0f3460] rounded text-gray-300">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm" style={{ color: char.disposition > 0 ? '#27ae60' : char.disposition < 0 ? '#e74c3c' : '#888' }}>
                        {char.disposition > 0 ? '😊' : char.disposition < 0 ? '😠' : '😐'} {char.disposition > 0 ? '+' : ''}{char.disposition}
                      </div>
                    </div>
                    <MessageCircle className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
