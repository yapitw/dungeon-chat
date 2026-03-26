import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from '@tanstack/react-router'
import { db } from '../lib/db'
import { initOpenAI, hasOpenAI, testConnection } from '../lib/ai'
import { ArrowLeft, Save, Key, Check, AlertCircle } from 'lucide-react'

const MODELS = [
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (Fast, Cheap)' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Fast, Cheap)' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'google/gemini-pro', name: 'Gemini Pro' },
  { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B (Free)' },
  { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B (Free)' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const settings = useLiveQuery(() => db.settings.get('default'))
  
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('anthropic/claude-3-haiku')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    if (settings) {
      setApiKey(settings.openaiApiKey || '')
      setModel(settings.model || 'anthropic/claude-3-haiku')
    }
  }, [settings])

  const handleSave = async () => {
    setError(null)

    // Validate API key format
    if (apiKey && apiKey.length < 10) {
      setError('API key seems too short')
      return
    }

    await db.settings.put({
      id: 'default',
      openaiApiKey: apiKey || undefined,
      model,
    })

    // Initialize with API key
    if (apiKey) {
      initOpenAI(apiKey)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTest = async () => {
    if (!apiKey) {
      setError('Please enter an API key first')
      return
    }
    
    setTesting(true)
    setError(null)
    
    try {
      const success = await testConnection(apiKey)
      if (success) {
        setError(null)
        alert('✅ Connection successful!')
      } else {
        setError('Connection failed. Check your API key.')
      }
    } catch {
      setError('Failed to connect. Check your internet connection.')
    } finally {
      setTesting(false)
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
        {/* OpenRouter Section */}
        <div className="bg-[#16213e] rounded-xl border border-[#0f3460] p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#10a37f]/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-[#10a37f]" />
            </div>
            <div>
              <h2 className="font-semibold">OpenRouter API</h2>
              <p className="text-sm text-gray-400">Unified API for 100+ AI models</p>
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
                  placeholder="sk-or-..."
                  className="flex-1 bg-[#0f3460] border border-[#0f3460] rounded-lg px-3 py-2 font-mono text-sm"
                />
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="px-4 py-2 bg-[#333] hover:bg-[#444] rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  {testing ? 'Testing...' : 'Test'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#3498db] hover:underline"
                >
                  openrouter.ai/keys
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
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Different models have different capabilities and pricing
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

        {/* Model Info */}
        <div className="bg-[#16213e] rounded-xl border border-[#0f3460] p-6 mb-6">
          <h2 className="font-semibold mb-4">Available Models</h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-400">
              OpenRouter provides access to models from multiple providers:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li><span className="text-white">Anthropic</span> - Claude family</li>
              <li><span className="text-white">OpenAI</span> - GPT family</li>
              <li><span className="text-white">Google</span> - Gemini family</li>
              <li><span className="text-white">Meta</span> - Llama family</li>
              <li><span className="text-white">Mistral</span> - Mistral family</li>
            </ul>
            <p className="text-gray-500 text-xs mt-3">
              Some models are free, others pay-per-use. Check OpenRouter for pricing.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-[#16213e] rounded-xl border border-[#0f3460] p-6">
          <h2 className="font-semibold mb-4">About</h2>
          <div className="text-sm text-gray-400 space-y-2">
            <p><strong className="text-white">Dungeon Chat</strong> v1.0</p>
            <p>Chat with fantasy characters powered by AI via OpenRouter.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
