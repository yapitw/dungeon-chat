import { useState, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate } from '@tanstack/react-router'
import { db } from '../lib/db'
import { sendMessage, extractMemory, hasOpenAI } from '../lib/ai'
import { ArrowLeft, Send, Trash2, Edit2, Save, X, Plus, Minus, AlertCircle } from 'lucide-react'

export default function CharacterChatPage() {
  const { worldId, characterId } = useParams({ from: '/worlds/$worldId/characters/$characterId' })
  const navigate = useNavigate()
  
  const world = useLiveQuery(() => db.worlds.get(worldId), [worldId])
  const character = useLiveQuery(() => db.characters.get(characterId), [characterId])
  const messages = useLiveQuery(
    () => db.messages.where('characterId').equals(characterId).sortBy('createdAt'),
    [characterId]
  )
  const memories = useLiveQuery(
    () => db.memories.where('characterId').equals(characterId).reverse().sortBy('createdAt'),
    [characterId]
  )


  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (character && !editForm) {
      setEditForm({
        name: character.name,
        title: character.title,
        avatar: character.avatar,
        color: character.color,
        personality: character.personality.join(', '),
        speechPattern: character.speechPattern,
        greeting: character.greeting,
        backstory: character.backstory,
        disposition: character.disposition,
      })
    }
  }, [character])

  const handleSend = async () => {
    if (!input.trim() || isTyping || !character) return

    const userMessage = input.trim()
    setInput('')
    setIsTyping(true)
    setError(null)

    // Add user message
    await db.messages.add({
      id: crypto.randomUUID(),
      characterId,
      worldId,
      role: 'user',
      content: userMessage,
      createdAt: new Date(),
    })

    try {
      if (!hasOpenAI()) {
        throw new Error('OpenAI not configured. Please add your API key in Settings.')
      }

      // Build conversation history for AI
      const conversationHistory = (messages ?? []).slice(-10).map(m => ({
        role: m.role as 'user' | 'character',
        content: m.content,
      }))
      conversationHistory.push({ role: 'user', content: userMessage })

      // Get AI response
      const response = await sendMessage(character, worldId, userMessage, conversationHistory)

      // Add character response
      await db.messages.add({
        id: crypto.randomUUID(),
        characterId,
        worldId,
        role: 'character',
        content: response,
        createdAt: new Date(),
      })

      // Extract memory after conversation
      await extractMemory(character, worldId, [...conversationHistory, { role: 'character' as const, content: response }])

    } catch (err: any) {
      setError(err.message || 'Failed to get response')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSaveEdit = async () => {
    if (!character || !editForm) return
    
    await db.characters.update(characterId, {
      name: editForm.name,
      title: editForm.title,
      avatar: editForm.avatar,
      color: editForm.color,
      personality: editForm.personality.split(',').map((s: string) => s.trim()).filter(Boolean),
      speechPattern: editForm.speechPattern,
      greeting: editForm.greeting,
      backstory: editForm.backstory,
      disposition: editForm.disposition,
      updatedAt: new Date(),
    })
    setIsEditing(false)
  }

  const handleDeleteMemory = async (memoryId: string) => {
    await db.memories.delete(memoryId)
  }

  const handleClearChat = async () => {
    if (!confirm('Clear all messages with this character?')) return
    await db.messages.where('characterId').equals(characterId).delete()
  }

  if (!world || !character) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (isEditing && editForm) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] text-white">
        <header className="border-b border-[#1e1e3f] px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <h1 className="font-semibold">Edit Character</h1>
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-2 text-[#27ae60] hover:text-[#2ecc71] transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </header>
        
        <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-[#16213e] border border-[#0f3460] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full bg-[#16213e] border border-[#0f3460] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Avatar (emoji)</label>
              <input
                value={editForm.avatar}
                onChange={e => setEditForm({ ...editForm, avatar: e.target.value })}
                className="w-full bg-[#16213e] border border-[#0f3460] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Color (hex)</label>
              <input
                type="color"
                value={editForm.color}
                onChange={e => setEditForm({ ...editForm, color: e.target.value })}
                className="w-full h-10 bg-[#16213e] border border-[#0f3460] rounded-lg cursor-pointer"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Personality (comma separated)</label>
            <input
              value={editForm.personality}
              onChange={e => setEditForm({ ...editForm, personality: e.target.value })}
              placeholder="jovial, greedy, suspicious..."
              className="w-full bg-[#16213e] border border-[#0f3460] rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Speech Pattern</label>
            <textarea
              value={editForm.speechPattern}
              onChange={e => setEditForm({ ...editForm, speechPattern: e.target.value })}
              placeholder="Speaks in a hearty, jolly manner..."
              rows={2}
              className="w-full bg-[#16213e] border border-[#0f3460] rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Greeting</label>
            <textarea
              value={editForm.greeting}
              onChange={e => setEditForm({ ...editForm, greeting: e.target.value })}
              rows={2}
              className="w-full bg-[#16213e] border border-[#0f3460] rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Backstory</label>
            <textarea
              value={editForm.backstory}
              onChange={e => setEditForm({ ...editForm, backstory: e.target.value })}
              rows={4}
              className="w-full bg-[#16213e] border border-[#0f3460] rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Disposition (-100 to 100)</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditForm({ ...editForm, disposition: Math.max(-100, editForm.disposition - 10) })}
                className="p-2 bg-[#16213e] rounded-lg"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-bold w-16 text-center">{editForm.disposition}</span>
              <button
                onClick={() => setEditForm({ ...editForm, disposition: Math.min(100, editForm.disposition + 10) })}
                className="p-2 bg-[#16213e] rounded-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1e1e3f] px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate({ to: '/worlds/$worldId', params: { worldId } })}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: character.color + '33' }}
        >
          {character.avatar}
        </div>
        
        <div className="flex-1">
          <h1 className="font-semibold">{character.name}</h1>
          <p className="text-xs text-gray-400">{character.title}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Edit Character"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 px-4 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-200">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Greeting message if no messages */}
        {(!messages || messages.length === 0) && (
          <div className="text-center py-8">
            <div 
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-4"
              style={{ backgroundColor: character.color + '33' }}
            >
              {character.avatar}
            </div>
            <p className="text-gray-400 italic">"{character.greeting}"</p>
            <p className="text-xs text-gray-500 mt-2">Start chatting to begin the conversation!</p>
          </div>
        )}

        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[70%] rounded-2xl px-4 py-3"
              style={{
                background: msg.role === 'user' 
                  ? '#e94560' 
                  : character.color + '33',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'character' ? '4px' : '16px',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-4 py-3 italic text-gray-400"
              style={{ background: character.color + '33' }}
            >
              {character.name} is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#1e1e3f] p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${character.name}...`}
            disabled={isTyping}
            className="flex-1 bg-[#16213e] border border-[#0f3460] rounded-full px-5 py-3 outline-none focus:border-[#e94560] transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-full bg-[#e94560] hover:bg-[#d63651] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Memory Panel */}
      {memories && memories.length > 0 && (
        <div className="border-t border-[#1e1e3f] p-4 bg-[#0d0d1a]">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Character Memories</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {memories.map(memory => (
              <div
                key={memory.id}
                className="flex-shrink-0 bg-[#16213e] rounded-lg px-3 py-2 text-sm flex items-center gap-2"
              >
                <span style={{ color: character.color }}>💭</span>
                <span className="text-gray-300">{memory.content}</span>
                <button
                  onClick={() => handleDeleteMemory(memory.id)}
                  className="text-gray-500 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
