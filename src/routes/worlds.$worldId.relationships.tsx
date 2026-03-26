import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate } from '@tanstack/react-router'
import { db, type Character, type CharacterRelationship } from '../lib/db'
import { ArrowLeft, Plus, Trash2, Edit2, Save, Lock } from 'lucide-react'

const relationTypes = [
  'ally', 'enemy', 'family', 'friend', 'rival', 'merchant', 'ruler', 
  'servant', 'guardian', 'lover', 'rival', 'comrade', 'employer', 'regular'
]

export default function RelationshipsPage() {
  const { worldId } = useParams({ from: '/worlds/$worldId/relationships' })
  const navigate = useNavigate()
  
  const world = useLiveQuery(() => db.worlds.get(worldId), [worldId])
  const characters = useLiveQuery(
    () => db.characters.where('worldId').equals(worldId).toArray(),
    [worldId]
  )
  const relationships = useLiveQuery(
    () => db.relationships.where('worldId').equals(worldId).toArray(),
    [worldId]
  )

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    sourceCharacterId: '',
    targetCharacterId: '',
    relationType: 'ally',
    label: '',
    strength: 50,
    isSecret: false,
    description: '',
  })

  const resetForm = () => {
    setForm({
      sourceCharacterId: '',
      targetCharacterId: '',
      relationType: 'ally',
      label: '',
      strength: 50,
      isSecret: false,
      description: '',
    })
    setIsCreating(false)
  }

  const handleCreate = async () => {
    if (!form.sourceCharacterId || !form.targetCharacterId) return
    
    await db.relationships.add({
      id: crypto.randomUUID(),
      worldId,
      sourceCharacterId: form.sourceCharacterId,
      targetCharacterId: form.targetCharacterId,
      relationType: form.relationType,
      label: form.label || undefined,
      strength: form.strength,
      isSecret: form.isSecret,
      description: form.description,
    })
    resetForm()
  }

  const handleUpdate = async () => {
    if (!editingId) return
    
    await db.relationships.update(editingId, {
      relationType: form.relationType,
      label: form.label || undefined,
      strength: form.strength,
      isSecret: form.isSecret,
      description: form.description,
    })
    setEditingId(null)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this relationship?')) return
    await db.relationships.delete(id)
  }

  const startEdit = (rel: CharacterRelationship) => {
    setForm({
      sourceCharacterId: rel.sourceCharacterId,
      targetCharacterId: rel.targetCharacterId,
      relationType: rel.relationType,
      label: rel.label || '',
      strength: rel.strength,
      isSecret: rel.isSecret,
      description: rel.description,
    })
    setEditingId(rel.id)
    setIsCreating(true)
  }

  const getCharacter = (id: string): Character | undefined => {
    return characters?.find(c => c.id === id)
  }

  const getRelationStrength = (strength: number): string => {
    if (strength >= 80) return '💪 Strong'
    if (strength >= 50) return '🤝 Moderate'
    if (strength >= 20) return '🤏 Weak'
    return '💔 Fragile'
  }

  if (!world || !characters) {
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
            onClick={() => navigate({ to: '/worlds/$worldId', params: { worldId } })}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to World
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔗</span>
              <div>
                <h1 className="text-xl font-bold">Relationship Network</h1>
                <p className="text-xs text-gray-500">{world.name}</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-[#9b59b6] hover:bg-[#8e44ad] rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Relationship
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Create/Edit Form */}
        {isCreating && (
          <div className="bg-[#16213e] rounded-xl border border-[#9b59b6] p-6 mb-8">
            <h3 className="font-semibold mb-4">{editingId ? 'Edit Relationship' : 'New Relationship'}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">From Character</label>
                <select
                  value={form.sourceCharacterId}
                  onChange={e => setForm({ ...form, sourceCharacterId: e.target.value })}
                  disabled={!!editingId}
                  className="w-full bg-[#0f3460] border border-[#0f3460] rounded-lg px-3 py-2 disabled:opacity-50"
                >
                  <option value="">Select...</option>
                  {characters.map(c => (
                    <option key={c.id} value={c.id}>{c.avatar} {c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">To Character</label>
                <select
                  value={form.targetCharacterId}
                  onChange={e => setForm({ ...form, targetCharacterId: e.target.value })}
                  disabled={!!editingId}
                  className="w-full bg-[#0f3460] border border-[#0f3460] rounded-lg px-3 py-2 disabled:opacity-50"
                >
                  <option value="">Select...</option>
                  {characters.filter(c => c.id !== form.sourceCharacterId).map(c => (
                    <option key={c.id} value={c.id}>{c.avatar} {c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Relationship Type</label>
                <select
                  value={form.relationType}
                  onChange={e => setForm({ ...form, relationType: e.target.value })}
                  className="w-full bg-[#0f3460] border border-[#0f3460] rounded-lg px-3 py-2"
                >
                  {relationTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Label (optional)</label>
                <input
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. childhood friend"
                  className="w-full bg-[#0f3460] border border-[#0f3460] rounded-lg px-3 py-2"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Strength: {form.strength}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.strength}
                onChange={e => setForm({ ...form, strength: parseInt(e.target.value) })}
                className="w-full accent-[#9b59b6]"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Describe this relationship..."
                className="w-full bg-[#0f3460] border border-[#0f3460] rounded-lg px-3 py-2"
              />
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isSecret}
                  onChange={e => setForm({ ...form, isSecret: e.target.checked })}
                  className="w-4 h-4 accent-[#9b59b6]"
                />
                <span className="text-sm text-gray-400">Secret relationship</span>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={!form.sourceCharacterId || !form.targetCharacterId}
                className="px-4 py-2 bg-[#9b59b6] hover:bg-[#8e44ad] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => { resetForm(); setEditingId(null); }}
                className="px-4 py-2 bg-[#333] hover:bg-[#444] rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Relationships List */}
        {relationships?.length === 0 && !isCreating ? (
          <div className="text-center py-16 bg-[#16213e] rounded-xl border border-[#0f3460]">
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">No relationships yet</h3>
            <p className="text-gray-400 mb-6">Connect characters to build your world's relationship network</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-[#9b59b6] hover:bg-[#8e44ad] rounded-lg transition-colors"
            >
              Add First Relationship
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {relationships?.map(rel => {
              const source = getCharacter(rel.sourceCharacterId)
              const target = getCharacter(rel.targetCharacterId)
              if (!source || !target) return null
              
              return (
                <div
                  key={rel.id}
                  className="bg-[#16213e] rounded-xl border border-[#0f3460] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Source */}
                      <div className="text-center">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: source.color + '33' }}
                        >
                          {source.avatar}
                        </div>
                        <div className="text-xs mt-1">{source.name.split(' ')[0]}</div>
                      </div>
                      
                      {/* Arrow & Type */}
                      <div className="flex flex-col items-center">
                        <div className="text-xs uppercase px-2 py-1 bg-[#9b59b6]/30 text-[#9b59b6] rounded">
                          {rel.relationType}
                        </div>
                        {rel.label && (
                          <div className="text-xs text-gray-400 mt-1">{rel.label}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {getRelationStrength(rel.strength)}
                        </div>
                        {rel.isSecret && (
                          <Lock className="w-3 h-3 text-gray-500 mt-1" />
                        )}
                      </div>
                      
                      {/* Target */}
                      <div className="text-center">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: target.color + '33' }}
                        >
                          {target.avatar}
                        </div>
                        <div className="text-xs mt-1">{target.name.split(' ')[0]}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(rel)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rel.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {rel.description && (
                    <p className="text-sm text-gray-400 mt-3 pt-3 border-t border-[#0f3460]">
                      {rel.description}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
