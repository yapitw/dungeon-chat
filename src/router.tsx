import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'

// Import components
import WorldsPage from './routes/worlds'
import WorldDetailPage from './routes/worlds.$worldId'
import CharacterChatPage from './routes/worlds.$worldId.characters.$characterId'
import RelationshipsPage from './routes/worlds.$worldId.relationships'
import SettingsPage from './routes/settings'

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Index route - redirect to worlds
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    window.location.href = '/worlds'
    return null
  },
})

// Worlds list route
const worldsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/worlds',
  component: WorldsPage,
})

// World detail route
const worldDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/worlds/$worldId',
  component: WorldDetailPage,
})

// Character chat route
const characterChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/worlds/$worldId/characters/$characterId',
  component: CharacterChatPage,
})

// Relationships route
const relationshipsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/worlds/$worldId/relationships',
  component: RelationshipsPage,
})

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  worldsRoute,
  worldDetailRoute,
  characterChatRoute,
  relationshipsRoute,
  settingsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
