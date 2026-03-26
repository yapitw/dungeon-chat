-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "system" TEXT NOT NULL DEFAULT 'dnd5e',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "personality" TEXT NOT NULL DEFAULT '[]',
    "speechPattern" TEXT NOT NULL,
    "greeting" TEXT NOT NULL,
    "backstory" TEXT NOT NULL,
    "disposition" INTEGER NOT NULL DEFAULT 0,
    "isAlive" BOOLEAN NOT NULL DEFAULT true,
    "locationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterRelationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "sourceCharacterId" TEXT NOT NULL,
    "targetCharacterId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "label" TEXT,
    "strength" INTEGER NOT NULL DEFAULT 50,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    CONSTRAINT "CharacterRelationship_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CharacterRelationship_sourceCharacterId_fkey" FOREIGN KEY ("sourceCharacterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CharacterRelationship_targetCharacterId_fkey" FOREIGN KEY ("targetCharacterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemoryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "relevance" INTEGER NOT NULL DEFAULT 7,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemoryEntry_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MemoryEntry_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationMessage_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationMessage_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "openaiApiKey" TEXT,
    "model" TEXT NOT NULL DEFAULT 'anthropic/claude-3-haiku'
);
