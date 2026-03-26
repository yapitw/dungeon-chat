import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from '@tanstack/react-router'
import { db } from '../lib/db'
import { initOpenAI, hasOpenAI } from '../lib/ai'
import { ArrowLeft, Save, Key, Check, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const settings = useLiveQuery(() => db.settings.get('default'))
  
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (settings) {
      setApiKey(settings.openaiApiKey || '')
      setModel(settings.model || 'gpt-4o-mini')
    }
  }, [settings])

  const handleSave = async () => {
    setError(null)
    
    // Validate API key format
    if (apiKey && !apiKey.startsWith('sk-')) {
      setError('Invalid API key format. OpenAI keys start with "sk-"')
      return
    }

    await db.settings.put({
      id: 'default',
      openaiApiKey: apiKey || undefined,
      model,
    })

    // Initialize OpenAI if key provided
    if (apiKey) {
      try {
        initOpenAI(apiKey)
      } catch (err) {
        setError('Failed to initialize OpenAI. Please check your API key.')
        return
      }
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const testConnection = async () => {
    if (!apiKey) {
      setError('Please enter an API key first')
      return
    }
    
    try {
      initOpenAI(apiKey)
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })
      
      if (response.ok) {
        setError(null)
        alert('✅ Connection successful!')
      } else {
        setError('Invalid API key')
      }
    } catch {
      setError('Failed to connect. Check your internet connection.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Header */}
      <header className="border-b border-[#1e1e3f] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/worlds' })}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* OpenAI Section */}
        <div className="bg-[#16213e] rounded-xl border border-[#0f3460] p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#10a37f]/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-[#10a37f]" />
            </div>
            <div>
              <h2 className="font-semibold">OpenAI API</h2>
              <p className="text-sm text-gray-400">Required for AI-powered chat</p>
            </div>
            {hasOpenAI() && (
              <span className="ml-auto text-xs px-2 py-1 bg-[#27ae60]/20 text-[#27ae60] rounded flex items-center gap-1">
                <Check className="w-3 h-3" /> Connected
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1 bg-[#0f3460] border border-[#0f3460] rounded-lg px-3 py-2 font-mono text-sm"
                />
                <button
                  onClick={testConnection}
                  className="px-4 py-2 bg-[#333] hover:bg-[#444] rounded-lg transition-colors text-sm"
                >
                  Test
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#3498db] hover:underline"
                >
                  platform.openai.com
                </a>
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Model</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-[#0f3460] border border-[#0f3460] rounded-lg px-3 py-2"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Fast, Cheap)</option>
                <option value="gpt-4o">GPT-4o (More Capable)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                GPT-4o Mini is recommended for best speed/cost balance
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full py-2 bg-[#e94560] hover:bg-[#d63651] rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-[#16213e] rounded-xl border border-[#0f3460] p-6">
          <h2 className="font-semibold mb-4">About</h2>
          <div className="text-sm text-gray-400 space-y-2">
            <p><strong className="text-white">Dungeon Chat</strong> v1.0</p>
            <p>A character chat application with AI-powered conversations, memory systems, and relationship networks.</p>
            <p className="pt-2 border-t border-[#0f3460]">
              Built with Vite, React, TanStack Router, Dexie, and Tailwind CSS.
            </p>
          </div>
        </div>

        {/* Data Section */}
        <div className="bg-[#16213e] rounded-xl border border-[#0f3460] p-6 mt-6">
          <h2 className="font-semibold mb-4">Data</h2>
          <p className="text-sm text-gray-400 mb-4">
            All data is stored locally in your browser using IndexedDB. No data is sent to any server except OpenAI for AI processing.
          </p>
          <button
            onClick={async () => {
              if (!confirm('Delete ALL data? This cannot be undone.')) return
              await db.delete()
              await db.open()
              window.location.reload()
            }}
            className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-300 rounded-lg transition-colors text-sm"
          >
            Delete All Data
          </button>
        </div>
      </main>
    </div>
  )
}
