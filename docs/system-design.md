# Graph-First Node Editor (ThinkCanvas) — System Design

## 1. Product Scope

This system is a **graph-first node editor** built using React Flow in Next.js.

It is NOT:

* A Figma clone
* A full Excalidraw replacement

It MAY EVOLVE into:

* A hybrid graph + canvas system

---

## 2. High-Level Architecture

```
apps/
  eigenstudio-editor (Next.js app)

packages/
  ui/                  → shared components (shadcn based)
  editor-core/         → graph + canvas logic
  collaboration/       → yjs / ws layer
  schema/              → zod schemas

services/
  api (Fastify)
  realtime (WebSocket server)
```

---

## 3. Frontend Architecture

### Editor Layering

```
/editor
  /core
    - ReactFlow wrapper
    - Node registry
    - Edge logic
    - State adapters

  /canvas (future)
    - drawing engine
    - tools (pen, shapes, text)

  /features
    - undo/redo
    - copy/paste
    - zoom/pan
    - shortcuts

  /store
    - Zustand store
    - graph state
    - UI state

  /components
    - NodeRenderer
    - Toolbar
    - Inspector Panel
```

---

## 4. Tech Stack

### Frontend

* Next.js (App Router)
* React Flow
* Zustand
* Immer
* shadcn/ui
* Tailwind CSS
* dnd-kit

### Backend

* Node.js + Fastify
* PostgreSQL
* Prisma ORM
* Redis
* WebSocket (ws)

### Realtime

* Yjs + y-websocket

---

## 5. Data Model

### Node

```ts
Node {
  id: string
  type: string
  position: { x: number, y: number }
  data: JSON
}
```

### Edge

```ts
Edge {
  id: string
  source: string
  target: string
  type: string
}
```

### Document Strategy

* Store full graph as JSON
* Version snapshots
* Add diff-based updates later

---

## 6. Core System Patterns

### Node Registry

```ts
const nodeRegistry = {
  text: TextNode,
  api: ApiNode,
  condition: ConditionNode
}
```

### State Management

* Central Zustand store
* React Flow used only as renderer

### Undo/Redo

* Snapshot-based or command pattern

---

## 7. Feature Roadmap

### Phase 1 (MVP)

* Node creation
* Edge connection
* Drag / move
* Zoom / pan
* Save / load JSON

### Phase 2

* Undo / redo
* Inspector panel
* Keyboard shortcuts
* Auto-layout (dagre)

### Phase 3

* Collaboration (Yjs)
* Presence system
* Real-time sync

### Phase 4

* Drawing tools
* Shapes & annotations
* Export (PNG / SVG)

---

## 8. Execution Plan

### Week 1

* Setup Next.js
* Integrate React Flow
* Basic node + edge system
* Zustand store

### Week 2

* Toolbar
* Delete / duplicate
* Save/load

### Week 3

* Node registry
* Inspector panel
* Custom nodes

### Week 4

* Undo/redo
* Shortcuts
* Auto-layout

### Week 5+

* Collaboration
* Backend persistence

---

## 9. Critical Constraints

* Do not mix UI and graph state
* Do not hardcode node types
* Avoid Redux (overhead)
* Avoid premature canvas system

---
