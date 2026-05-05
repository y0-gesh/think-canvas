# ThinkCanvas

**ThinkCanvas** is a graph-first node editor built for structured thinking, visual workflows, and extensible systems design.
It prioritizes **graph logic over freeform drawing**, with a clear path toward evolving into a hybrid graph + canvas platform.

---

## Overview

ThinkCanvas is not another whiteboard clone. It is designed as:

* A **graph-based thinking system**
* A **node-driven editor for structured workflows**
* A **developer-friendly, extensible platform**

It intentionally avoids trying to replicate tools like Excalidraw or design suites. Instead, it focuses on **logic, relationships, and systems modeling**.

---

## Product Scope

### What it is

* Graph-first node editor
* Visual system builder
* Extensible architecture for custom node types

### What it is NOT

* Not a Figma alternative
* Not a pixel-perfect design tool
* Not a pure drawing whiteboard

### Future Direction

* Hybrid **graph + canvas system**
* Visual + logical workflows combined

---

## Architecture

### Monorepo Structure

```
apps/
  eigenstudio-editor     # Next.js editor app

packages/
  ui/                    # Shared UI (shadcn-based)
  editor-core/           # Graph + canvas logic
  collaboration/         # Yjs + WebSocket layer
  schema/                # Zod schemas

services/
  api                    # Fastify backend
  realtime               # WebSocket server
```

---

## Frontend Architecture

### Editor Layering

```
/editor
  /core
    - React Flow wrapper
    - Node registry
    - Edge logic
    - State adapters

  /canvas (future)
    - Drawing engine
    - Tools (pen, shapes, text)

  /features
    - Undo/redo
    - Copy/paste
    - Zoom/pan
    - Shortcuts

  /store
    - Zustand store
    - Graph state
    - UI state

  /components
    - NodeRenderer
    - Toolbar
    - Inspector Panel
```

### Key Principles

* **React Flow is only a renderer**, not the source of truth
* **Zustand manages all state**
* Clear separation between:

  * Graph logic
  * UI state
  * Rendering layer

---

## Tech Stack

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
* WebSocket (`ws`)

### Realtime

* Yjs
* y-websocket

---

## Data Model

### Node

```ts
type Node = {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, any>
}
```

### Edge

```ts
type Edge = {
  id: string
  source: string
  target: string
  type: string
}
```

### Document Strategy

* Store full graph as JSON
* Maintain version snapshots
* Introduce diff-based updates later

---

## Core System Patterns

### Node Registry

```ts
const nodeRegistry = {
  text: TextNode,
  api: ApiNode,
  condition: ConditionNode
}
```

* No hardcoding in rendering layer
* Fully extensible node system

---

### State Management

* Centralized Zustand store
* React Flow acts as a **view layer only**

---

### Undo / Redo

* Snapshot-based initially
* Can evolve into command pattern

---

## Feature Roadmap

### Phase 1 — MVP

* Node creation
* Edge connections
* Drag & move
* Zoom / pan
* Save / load (JSON)

---

### Phase 2

* Undo / redo
* Inspector panel
* Keyboard shortcuts
* Auto-layout (Dagre)

---

### Phase 3

* Real-time collaboration (Yjs)
* Presence system
* Multi-user sync

---

### Phase 4

* Drawing tools
* Shapes & annotations
* Export (PNG / SVG)

---

## Execution Plan

### Week 1

* Setup Next.js
* Integrate React Flow
* Basic node + edge system
* Zustand store

### Week 2

* Toolbar
* Delete / duplicate
* Save/load functionality

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

## Design Constraints (Non-Negotiable)

* Do **not** mix UI and graph state
* Do **not** hardcode node types
* Avoid Redux (unnecessary complexity)
* Avoid premature canvas implementation
* Keep rendering layer replaceable

---

## Why ThinkCanvas Exists

Most tools optimize for **drawing**.
ThinkCanvas optimizes for **thinking in systems**.

If your goal is:

* Modeling workflows
* Building logic graphs
* Structuring ideas visually

Then ThinkCanvas is the correct abstraction.

---

## Status

Early-stage development (MVP in progress)

---

## Contributing

Contributions will be opened once the core architecture stabilizes.
Initial focus is on building a **solid, extensible foundation**, not feature bloat.

---

## License

TBD (likely MIT for open-source adoption)

---

## Final Note

If this becomes just another visual editor, it fails.

The goal is to build:

> A system for thinking, not just drawing.

Keep that constraint in mind while contributing or extending the platform.
