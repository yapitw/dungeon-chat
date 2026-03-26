import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from '@tanstack/react-router'
import { db, seedDemoData } from '../lib/db'
import { Globe, Plus, ChevronRight, Sword, Skull, Compass } from 'lucide-react'

const systemIcons: Record<string, React.ReactNode> = {
  dnd5e: <Sword className="w-4 h-4" />,
  coc7e: <Skull className="w-4 h-4" />,
  pathfinder2e: <Compass className="w-4 h-4" />,
  custom: <Globe className="w-4 h-4" />,
}

export default function WorldsPage() {
  const navigate = useNavigate()
  const worlds = useLiveQuery(() => db.worlds.toArray())

  const handleCreateWorld = async () => {
    const id = crypto.randomUUID()
    await db.worlds.add({
      id,
      name: 'New World',
      description: 'A new adventure awaits...',
      system: 'dnd5e',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    navigate({ to: '/worlds/$worldId', params: { worldId: id } })
  }

  const handleSeedDemo = async () => {
    await seedDemoData()
    // Refresh
    window.location.reload()
  }

  if (!worlds) {
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏰</span>
            <div>
              <h1 className="text-xl font-bold text-[#e94560]">Dungeon Chat</h1>
              <p className="text-xs text-gray-500">地下城角色聊天系統</p>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: '/settings' })}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Your Worlds</h2>
          <div className="flex gap-3">
            <button
              onClick={handleSeedDemo}
              className="px-4 py-2 text-sm bg-[#1e1e3f] hover:bg-[#2a2a5f] rounded-lg transition-colors"
            >
              📦 Load Demo
            </button>
            <button
              onClick={handleCreateWorld}
              className="px-4 py-2 text-sm bg-[#e94560] hover:bg-[#d63651] rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New World
            </button>
          </div>
        </div>

        {worlds.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold mb-2">No worlds yet</h3>
            <p className="text-gray-400 mb-6">Create your first world to start chatting with characters</p>
            <button
              onClick={handleCreateWorld}
              className="px-6 py-3 bg-[#e94560] hover:bg-[#d63651] rounded-lg transition-colors"
            >
              Create World
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {worlds.map((world) => (
              <button
                key={world.id}
                onClick={() => navigate({ to: '/worlds/$worldId', params: { worldId: world.id } })}
                className="w-full text-left p-5 bg-[#16213e] hover:bg-[#1a2744] rounded-xl border border-[#0f3460] transition-all hover:border-[#e94560]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0f3460] flex items-center justify-center">
                      {systemIcons[world.system] || <Globe className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{world.name}</h3>
                      <p className="text-sm text-gray-400">{world.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="uppercase px-2 py-0.5 bg-[#0f3460] rounded">{world.system}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
