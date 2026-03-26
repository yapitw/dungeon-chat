import express from 'express'
import cors from 'cors'
import { PrismaClient } from '../src/generated/prisma'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// Worlds
app.get('/api/worlds', async (req, res) => {
  const worlds = await prisma.world.findMany({
    include: { _count: { select: { characters: true, relationships: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(worlds)
})

app.get('/api/worlds/:id', async (req, res) => {
  const world = await prisma.world.findUnique({
    where: { id: req.params.id },
    include: { characters: true, _count: { select: { characters: true, relationships: true } } },
  })
  if (!world) return res.status(404).json({ error: 'World not found' })
  res.json(world)
})

app.post('/api/worlds', async (req, res) => {
  const world = await prisma.world.create({ data: req.body })
  res.json(world)
})

app.put('/api/worlds/:id', async (req, res) => {
  const world = await prisma.world.update({ where: { id: req.params.id }, data: req.body })
  res.json(world)
})

app.delete('/api/worlds/:id', async (req, res) => {
  await prisma.world.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Characters
app.get('/api/worlds/:worldId/characters', async (req, res) => {
  const characters = await prisma.character.findMany({
    where: { worldId: req.params.worldId },
    orderBy: { createdAt: 'asc' },
  })
  res.json(characters)
})

app.get('/api/characters/:id', async (req, res) => {
  const character = await prisma.character.findUnique({ where: { id: req.params.id } })
  if (!character) return res.status(404).json({ error: 'Character not found' })
  res.json(character)
})

app.post('/api/worlds/:worldId/characters', async (req, res) => {
  const character = await prisma.character.create({
    data: { ...req.body, worldId: req.params.worldId },
  })
  res.json(character)
})

app.put('/api/characters/:id', async (req, res) => {
  const character = await prisma.character.update({ where: { id: req.params.id }, data: req.body })
  res.json(character)
})

app.delete('/api/characters/:id', async (req, res) => {
  await prisma.character.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Relationships
app.get('/api/worlds/:worldId/relationships', async (req, res) => {
  const relationships = await prisma.characterRelationship.findMany({
    where: { worldId: req.params.worldId },
    include: {
      sourceCharacter: { select: { id: true, name: true, avatar: true, color: true } },
      targetCharacter: { select: { id: true, name: true, avatar: true, color: true } },
    },
  })
  res.json(relationships)
})

app.post('/api/worlds/:worldId/relationships', async (req, res) => {
  const relationship = await prisma.characterRelationship.create({
    data: { ...req.body, worldId: req.params.worldId },
  })
  res.json(relationship)
})

app.put('/api/relationships/:id', async (req, res) => {
  const relationship = await prisma.characterRelationship.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(relationship)
})

app.delete('/api/relationships/:id', async (req, res) => {
  await prisma.characterRelationship.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Memories
app.get('/api/characters/:characterId/memories', async (req, res) => {
  const memories = await prisma.memoryEntry.findMany({
    where: { characterId: req.params.characterId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(memories)
})

app.post('/api/characters/:characterId/memories', async (req, res) => {
  const memory = await prisma.memoryEntry.create({
    data: { ...req.body, characterId: req.params.characterId },
  })
  res.json(memory)
})

app.delete('/api/memories/:id', async (req, res) => {
  await prisma.memoryEntry.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Messages
app.get('/api/characters/:characterId/messages', async (req, res) => {
  const messages = await prisma.conversationMessage.findMany({
    where: { characterId: req.params.characterId },
    orderBy: { createdAt: 'asc' },
  })
  res.json(messages)
})

app.post('/api/characters/:characterId/messages', async (req, res) => {
  const message = await prisma.conversationMessage.create({
    data: { ...req.body, characterId: req.params.characterId },
  })
  res.json(message)
})

app.delete('/api/characters/:characterId/messages', async (req, res) => {
  await prisma.conversationMessage.deleteMany({ where: { characterId: req.params.characterId } })
  res.json({ success: true })
})

// Settings
app.get('/api/settings', async (req, res) => {
  let settings = await prisma.settings.findUnique({ where: { id: 'default' } })
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: 'default', model: 'anthropic/claude-3-haiku' } })
  }
  res.json(settings)
})

app.put('/api/settings', async (req, res) => {
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    create: { id: 'default', ...req.body },
    update: req.body,
  })
  res.json(settings)
})

// Seed
app.post('/api/seed', async (req, res) => {
  const world = await prisma.world.create({
    data: {
      name: 'The Kingdom of Eldoria',
      description: 'A medieval fantasy realm with ancient magic and political intrigue.',
      system: 'dnd5e',
    },
  })

  const characters = await Promise.all([
    prisma.character.create({
      data: {
        worldId: world.id,
        name: 'Gareth Ironforge',
        title: 'Tavern Keeper',
        avatar: '🍺',
        color: '#e67e22',
        personality: JSON.stringify(['jovial', 'greedy', 'warm', 'gossip']),
        speechPattern: 'Speaks in a hearty, jolly manner, often breaking into laughter. Uses "ye" and "yer".',
        greeting: 'Hail, traveler! Welcome to the Rusty Dragon! What brings ye to my establishment?',
        backstory: 'Gareth is a middle-aged dwarf who has run the most popular tavern in the capital for 30 years.',
        disposition: 10,
        isAlive: true,
      },
    }),
    prisma.character.create({
      data: {
        worldId: world.id,
        name: 'Zephyrus the Wise',
        title: 'Court Wizard',
        avatar: '🔮',
        color: '#9b59b6',
        personality: JSON.stringify(['mysterious', 'wise', 'riddle', 'aloof']),
        speechPattern: 'Speaks in riddles and metaphors, often pausing dramatically.',
        greeting: 'Ahh... another seeker approaches. The threads of fate intertwine... What do you wish to know?',
        backstory: 'Zephyrus is an ancient wizard who has served three generations of kings.',
        disposition: 0,
        isAlive: true,
      },
    }),
    prisma.character.create({
      data: {
        worldId: world.id,
        name: 'Marcus Thornwood',
        title: 'Captain of the Guard',
        avatar: '🛡️',
        color: '#3498db',
        personality: JSON.stringify(['honorable', 'strict', 'suspicious', 'duty-bound']),
        speechPattern: 'Speaks formally and directly, addressing people by their titles.',
        greeting: 'Halt! State your business, citizen. The city guard has no patience for troublemakers.',
        backstory: 'Marcus rose through the ranks of the city guard over 20 years.',
        disposition: -10,
        isAlive: true,
      },
    }),
    prisma.character.create({
      data: {
        worldId: world.id,
        name: 'Pip Snapfinger',
        title: 'Street Urchin',
        avatar: '🐀',
        color: '#27ae60',
        personality: JSON.stringify(['quick-witted', 'street-smart', 'loyal', 'mischievous']),
        speechPattern: "Speaks fast and uses slang. Calls everyone 'mate'.",
        greeting: "Oi! Lookee here, a fancy pants! Pip's the name, survival's the game!",
        backstory: 'Pip is an orphan who grew up on the streets and now leads a small gang of urchins.',
        disposition: 20,
        isAlive: true,
      },
    }),
    prisma.character.create({
      data: {
        worldId: world.id,
        name: 'Lady Isolde Ashford',
        title: 'Noble Lady',
        avatar: '👸',
        color: '#e91e63',
        personality: JSON.stringify(['refined', 'calculating', 'secretive', 'ambitious']),
        speechPattern: 'Speaks with elegance and precision, using complex sentences.',
        greeting: 'How delightfully... unexpected. Do sit. Perhaps you might prove more amusing.',
        backstory: 'Lady Isolde is a powerful noblewoman from one of the oldest families in the kingdom.',
        disposition: 0,
        isAlive: true,
      },
    }),
    prisma.character.create({
      data: {
        worldId: world.id,
        name: 'Bronn Blackwater',
        title: 'Sellsword',
        avatar: '⚔️',
        color: '#c0392b',
        personality: JSON.stringify(['pragmatic', 'cynical', 'violent', 'honorable-to-a-fault']),
        speechPattern: 'Speaks bluntly, often about money, violence, or survival.',
        greeting: "You want muscle? I'm your man. So... what's it gonna be?",
        backstory: 'Bronn is a veteran mercenary who has fought in every war for the past decade.',
        disposition: 0,
        isAlive: true,
      },
    }),
  ])

  const [gareth, zephyrus, marcus, pip, isolde, bronn] = characters

  await Promise.all([
    prisma.characterRelationship.create({
      data: {
        worldId: world.id, sourceCharacterId: gareth.id, targetCharacterId: pip.id,
        relationType: 'guardian', label: 'Protects the urchins', strength: 60,
        description: "Gareth funds Pip's gang, Pip brings him gossip.",
      },
    }),
    prisma.characterRelationship.create({
      data: {
        worldId: world.id, sourceCharacterId: marcus.id, targetCharacterId: pip.id,
        relationType: 'enemy', label: 'Pursues aggressively', strength: 70,
        description: 'Marcus has been trying to catch Pip for years.',
      },
    }),
    prisma.characterRelationship.create({
      data: {
        worldId: world.id, sourceCharacterId: gareth.id, targetCharacterId: zephyrus.id,
        relationType: 'friends', label: 'Old drinking buddies', strength: 50,
        description: 'They met decades ago.',
      },
    }),
    prisma.characterRelationship.create({
      data: {
        worldId: world.id, sourceCharacterId: isolde.id, targetCharacterId: bronn.id,
        relationType: 'employer', label: 'Occasional employer', strength: 30,
        description: 'Isolde hires Bronn for special tasks.',
      },
    }),
  ])

  res.json({ success: true, worldId: world.id })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
