# Dungeon Chat - 地下城角色聊天系統

## 概念

一個可以與地下城 NPC 角色即時聊天的網站。每個角色都有獨特的性格、背景故事、記憶系統，讓對話自然且有深度。角色之間存在關係網絡，可以查詢誰認識誰、他們之間的關係為何。

## 設計原則

- **角色優先**：角色是核心，聊天是展示層
- **記憶真實**：AI 回覆基於角色性格 + 歷史記憶
- **關係網絡**：角色之間的關係影響對話內容
- **簡化技術**：Vite + React + Dexie（客戶端）+ OpenAI

## 核心資料模型

### World（世界）
```typescript
interface World {
  id: string
  name: string
  description: string
  system: 'dnd5e' | 'coc7e' | 'pathfinder2e' | 'custom'
  createdAt: Date
}
```

### Character（角色）
```typescript
interface Character {
  id: string
  worldId: string
  name: string
  title: string
  avatar: string        // emoji
  color: string         // UI 主色調
  
  // 性格設定
  personality: string[]  // 形容詞陣列 ["greed", "jovial", "suspicious"]
  speechPattern: string  // 說話風格 "speaks in rhymes" / "uses fancy words"
  greeting: string       // 初次見面打招呼
  backstory: string      // 背景故事（給 AI 看的）
  
  // 狀態
  disposition: number   // -100 到 100，對玩家的態度
  isAlive: boolean
  locationId?: string   // 目前位置
  createdAt: Date
  updatedAt: Date
}
```

### CharacterRelationship（角色關係）
```typescript
interface CharacterRelationship {
  id: string
  worldId: string
  sourceCharacterId: string
  targetCharacterId: string
  relationType: string   // "ally", "enemy", "family", "rival", "merchant", "ruler"
  label?: string        // "childhood friend", "sworn enemy"
  strength: number      // 0-100，關係深度
  isSecret: boolean    // 是否隱藏
  description: string  // 關係描述
}
```

### MemoryEntry（記憶）
```typescript
interface MemoryEntry {
  id: string
  characterId: string
  worldId: string
  content: string        // 記憶內容摘要
  sourceSessionId?: string
  relevance: number      // 重要性 0-10
  createdAt: Date
  expiresAt?: Date      // 可選，過期時間
}
```

### ConversationMessage（對話）
```typescript
interface ConversationMessage {
  id: string
  characterId: string
  role: 'user' | 'character'
  content: string
  context?: string       // AI prompt 用的上下文
  createdAt: Date
}
```

## 功能

### 1. 世界管理
- 建立、編輯、刪除世界
- 每個世界有獨立的角色和關係

### 2. 角色管理
- 在世界內建立角色
- 設定性格、背景、說話風格
- 設定初始態度和位置

### 3. 關係網絡
- 為角色建立關係
- 設定關係類型（盟友、敵人、家人、競爭者、商人之類）
- 設定關係強度和描述
- 檢視某角色的所有關係

### 4. 聊天系統
- 選擇角色開始聊天
- AI 根據角色性格 + 記憶生成回覆
- 對話結束後自動產生記憶摘要

### 5. 記憶系統
- 角色會記住重要的事
- 可以手動新增/刪除記憶
- 記憶影響 AI 回覆

## 技術架構

### 前端
- Vite + React + TypeScript
- TanStack Router（檔案路由）
- Tailwind CSS（樣式）
- Dexie（客戶端資料庫，IndexedDB）

### AI 整合
- OpenAI API（gpt-4o-mini 或 gpt-4o）
- 系統提示詞包含：
  1. 角色性格描述
  2. 最近的記憶摘要
  3. 說話風格要求
- 訊息歷史作為上下文

### 資料持久化
- Dexie（客戶端 IndexedDB）
- 所有資料存在瀏覽器本地
- 未來可擴展：登入同步、伺服器備份

## 路由結構

```
/                       # 登入/首頁
/worlds                 # 世界列表
/worlds/:worldId        # 世界總覽
/worlds/:worldId/characters/:characterId  # 角色聊天
/worlds/:worldId/relationships            # 關係網絡
/settings               # 設定（API key 等）
```

## UI 設計方向

### 配色
- 深色主題（#0f0f1a 底色）
- 角色有自己的主色調
- 系統強調色：#e94560（紅色）

### 佈局
- 左側：世界/角色導航
- 右側：主要內容（聊天或編輯）
- 角色選擇使用 emoji 頭像

### 動效
- 訊息淡入滑動
- typing 指示器
- 角色切換平滑過渡
