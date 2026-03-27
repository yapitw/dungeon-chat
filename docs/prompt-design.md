# Prompt Design Document

## Overview

Dungeon Chat uses OpenRouter API to power AI-driven character conversations. The app constructs dynamic prompts for each character based on their profile, relationships, and memories.

## Architecture

```
User Input → buildCharacterContext() → sendMessage() → OpenRouter API
                                              ↓
                                      extractMemory() → MemoryEntry DB
```

## Character Context Prompt

Built by `buildCharacterContext()` in `src/lib/ai.ts`:

```
Profile: {name}, {title}
Personality: {personality array joined}
Disposition: Friendly/Hostile/Neutral (score/100)

Background: {backstory}

Speech Style: {speechPattern}

Known Relationships:
- {targetName} ({relationType}{: label}): {description}
- ...

Recent Memories:
- {memory content}
- ...
```

### Disposition Mapping
- `disposition > 0` → "Friendly ({score}/100)"
- `disposition < 0` → "Hostile ({score}/100)"
- `disposition === 0` → "Neutral ({score}/100)"

## Chat System Prompt

Appended to character context in `sendMessage()`:

```
{characterContext}

STAY IN CHARACTER at all times. Never break character. Never use markdown. Keep responses to 1-3 paragraphs max.
```

### Parameters
- `max_tokens`: 500
- `temperature`: 0.8

## Memory Extraction Prompt

Used in `extractMemory()` to identify important moments:

```
Extract a brief memory (1-2 sentences) that this character should remember from the user's messages. If nothing important happened, respond with exactly "NONE".
```

### Parameters
- `max_tokens`: 100
- `temperature`: 0.3
- Uses last 6 messages (3 exchanges)

## Data Flow

### 1. Character Loading
Character data fetched from API includes:
- Basic info (name, title, avatar, color)
- Personality traits (stored as JSON array)
- Speech pattern
- Greeting message
- Backstory
- Disposition score (-100 to 100)

### 2. Context Building
When user sends a message:
1. Fetch last 10 messages for conversation history
2. Fetch character's relationships (filtered by character ID)
3. Fetch recent memories (slice of 5)
4. Build context string

### 3. Response Generation
1. Append system prompt to character context
2. Add conversation history (user + character messages)
3. Add current user message
4. Send to OpenRouter
5. Store response as character message in DB

### 4. Memory Formation
After each response:
1. Extract memory from last 6 messages
2. If not "NONE", store with relevance score of 7
3. Display in memory panel

## Relationship Types

Relationships are bidirectional with source/target:
- `relationType`: friend, enemy, family, guardian, employer, etc.
- `label`: optional short description (e.g., "Old drinking buddies")
- `description`: detailed explanation
- `strength`: 0-100 scale
- `isSecret`: whether hidden from player

## Prompt Engineering Best Practices

### For Character Developers
1. **Speech Pattern** should be specific and behavioral (e.g., "uses 'ye' and 'yer', laughs frequently")
2. **Backstory** provides grounding context for responses
3. **Personality traits** influence word choice and reactions
4. **Disposition** affects initial attitude (but relationships modify this)

### For Memory Extraction
1. Memories should be **character-relevant**, not world facts
2. Keep memories **short and evocative**
3. Extract **emotional or plot-relevant** moments
4. "NONE" responses are valid and expected

## Model Selection

Default model: `anthropic/claude-3-haiku`

Configurable via Settings page. Any OpenRouter-supported model works.

## Security Notes

- API key stored in SQLite via Settings model
- Key passed to server, never exposed to client
- Memory extraction uses same API key as chat
