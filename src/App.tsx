import { useState, useRef, useEffect } from 'react'
import './App.css'

// Character types
interface Character {
  id: string
  name: string
  title: string
  avatar: string
  description: string
  greeting: string
  color: string
}

// Pre-built dungeon characters
const CHARACTERS: Character[] = [
  {
    id: 'tavern-keeper',
    name: 'Gareth',
    title: 'Tavern Keeper',
    avatar: '🍺',
    description: 'A jolly dwarf who runs the Rusty Dragon tavern. Knows all the gossip.',
    greeting: 'Hail, traveler! Welcome to the Rusty Dragon! What brings ye to my establishment?',
    color: '#e67e22',
  },
  {
    id: 'mysterious-wizard',
    name: 'Zephyrus',
    title: 'Court Wizard',
    avatar: '🔮',
    description: 'An ancient wizard from the Tower of Eyes. Speaks in riddles.',
    greeting: 'Ahh... another seeker approaches. The threads of fate intertwine... What do you wish to know?',
    color: '#9b59b6',
  },
  {
    id: 'city-guard',
    name: 'Marcus',
    title: 'City Watch',
    avatar: '🛡️',
    description: 'A vigilant guard protecting the city gates. Suspicious but honorable.',
    greeting: 'Halt! State your business, citizen. The city guard has no patience for troublemakers.',
    color: '#3498db',
  },
  {
    id: 'street-urchin',
    name: 'Pip',
    title: 'Street Urchin',
    avatar: '🐀',
    description: 'A quick-witted orphan who knows every alley in the city.',
    greeting: "Oi! Lookee here, a fancy pants! Pip's the name, survival's the game. You need something, I know where to get it!",
    color: '#27ae60',
  },
  {
    id: 'noble-lady',
    name: 'Lady Isolde',
    title: 'Noble Lady',
    avatar: '👸',
    description: 'A refined noblewoman with secrets buried deep.',
    greeting: 'How delightfully... unexpected. Do sit. I was just contemplating matters of great tedium. Perhaps you might prove more interesting.',
    color: '#e91e63',
  },
  {
    id: 'grizzled-mercenary',
    name: 'Bronn',
    title: 'Sellsword',
    avatar: '⚔️',
    description: 'A battle-scarred warrior for hire. Pragmatic and dangerous.',
    greeting: "You want muscle? I'm your man. Copper on the line, I break skulls. Gold in your pocket, I take jobs. So... what's it gonna be?",
    color: '#c0392b',
  },
]

// Message type
interface Message {
  id: string
  role: 'user' | 'character'
  content: string
  timestamp: Date
}

// AI responses (simple pattern matching + randomization for demo)
const AI_RESPONSES: Record<string, string[]> = {
  'default': [
    "Interesting... tell me more about your quest.",
    "The winds of fate are ever-changing. Perhaps you should consult the oracle.",
    "HA! I've seen tougher adventurers turn tail and run. But I like your spirit.",
    "A fair question. The answer lies within the depths of the old temple.",
    "Gold speaks louder than words, friend. What's in it for me?",
  ],
  'quest': [
    "A quest, you say? I may know something of... opportunities. For the right price.",
    "The old crypts beneath the city hold secrets. Dangerous ones. Few return from exploring them.",
    "I've heard whispers of a cursed artifact. Best left alone, if ye ask me.",
  ],
  'help': [
    "I might be able to point ye in the right direction... for a small fee, naturally.",
    "The wizard in the tower knows more than I do. But his prices are steep.",
    "Quick tip: never trust a deal that sounds too good. Except this one.",
  ],
  'greeting': [
    "Well, well! A friendly face! How can I help ye this fine day?",
    "Back again? I was just thinking about ye. Good luck with that.",
    "Ahoy, friend! What news from the road?",
  ],
}

function getAIResponse(input: string): string {
  const lowerInput = input.toLowerCase()
  
  let category = 'default'
  if (lowerInput.includes('quest') || lowerInput.includes('mission') || lowerInput.includes('job')) {
    category = 'quest'
  } else if (lowerInput.includes('help') || lowerInput.includes('know') || lowerInput.includes('find')) {
    category = 'help'
  } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
    category = 'greeting'
  }
  
  const responses = AI_RESPONSES[category] || AI_RESPONSES['default']
  return responses[Math.floor(Math.random() * responses.length)]
}

export default function App() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize chat with character's greeting
  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'character',
        content: selectedCharacter.greeting,
        timestamp: new Date(),
      },
    ])
  }, [selectedCharacter])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = getAIResponse(input)
      const characterMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'character',
        content: aiResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, characterMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="app">
      {/* Sidebar - Character Selection */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">🏰 Dungeon Chat</h1>
          <p className="tagline">Chat with fantasy characters</p>
        </div>

        <div className="character-list">
          <h2 className="section-title">Characters</h2>
          {CHARACTERS.map((char) => (
            <button
              key={char.id}
              className={`character-btn ${selectedCharacter.id === char.id ? 'active' : ''}`}
              onClick={() => setSelectedCharacter(char)}
              style={{ '--accent': char.color } as React.CSSProperties}
            >
              <span className="avatar">{char.avatar}</span>
              <div className="char-info">
                <span className="char-name">{char.name}</span>
                <span className="char-title">{char.title}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          Built with React + Vite
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-area">
        {/* Chat Header */}
        <header className="chat-header">
          <span className="header-avatar">{selectedCharacter.avatar}</span>
          <div className="header-info">
            <h2>{selectedCharacter.name}</h2>
            <p>{selectedCharacter.title}</p>
          </div>
          <p className="header-desc">{selectedCharacter.description}</p>
        </header>

        {/* Messages */}
        <div className="messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="bubble">{msg.content}</div>
            </div>
          ))}

          {isTyping && (
            <div className="message character">
              <div className="bubble typing">
                {selectedCharacter.name} is typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Talk to ${selectedCharacter.name}...`}
              disabled={isTyping}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              📤
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
