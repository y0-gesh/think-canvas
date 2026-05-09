# ThinkCanvas

**Graph-first node editor** with drag-and-drop file attachments, 3D model preview, and full database persistence.  
Built with Next.js + React Flow + Fastify + PostgreSQL.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | ≥ 18 | [nodejs.org](https://nodejs.org) |
| **PostgreSQL** | ≥ 14 | [postgresql.org](https://www.postgresql.org/download/) |
| **Redis** *(optional)* | ≥ 7 | [redis.io](https://redis.io/download) — not required for current features |

---

## Quick Start

### 1. Clone & install deps

```bash
git clone <repo-url> think-canvas
cd think-canvas

# Frontend
cd tc-frontend
npm install

# Backend
cd ../tc-backend
npm install
```

### 2. Configure environment

**Backend** (`tc-backend/.env`):

```env
PORT=3002
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/thinkcanvas
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

**Frontend** (`tc-frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

> Change `postgres:postgres` to your actual PostgreSQL username:password.

### 3. Create the database

```bash
# Connect to PostgreSQL and create the database
psql -U postgres -c "CREATE DATABASE thinkcanvas;"
```

### 4. Run Prisma migration

```bash
cd tc-backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start everything

```bash
# Option A: Use the run script (see below)
./run.sh

# Option B: Manual start (2 terminals)

# Terminal 1 — Backend (port 3002)
cd tc-backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd tc-frontend
npm run dev
```

### 6. Open the app

Navigate to **http://localhost:3000**

---

## Project Structure

```
think-canvas/
├── tc-frontend/              # Next.js 16 (App Router)
│   ├── src/
│   │   ├── app/              # Pages & layout
│   │   ├── components/
│   │   │   └── editor/
│   │   │       ├── Canvas.tsx          # ReactFlow wrapper
│   │   │       ├── Sidebar.tsx         # Node palette
│   │   │       ├── Toolbar.tsx         # Add/Delete controls
│   │   │       ├── DraggableNode.tsx   # Sidebar draggable items
│   │   │       └── nodes/
│   │   │           ├── ThinkNode.tsx      # Custom node (edit, resize, file drop)
│   │   │           ├── Model3DViewer.tsx  # Three.js GLB/GLTF viewer
│   │   │           └── FilePreview.tsx    # Image/video/file preview
│   │   ├── store/
│   │   │   └── useStore.ts   # Zustand store (state + auto-save)
│   │   ├── styles/
│   │   │   └── globals.css   # Theme + node styles
│   │   └── vendors/ui/       # shadcn components
│   └── .env.local
│
├── tc-backend/               # Fastify API
│   ├── src/
│   │   ├── app.ts            # Server entry (CORS, plugins, routes)
│   │   ├── plugins/
│   │   │   ├── prisma.ts     # Prisma client (PG adapter)
│   │   │   └── redis.ts      # Redis (disabled by default)
│   │   └── routes/
│   │       ├── canvas.ts     # CRUD: /api/canvas
│   │       ├── upload.ts     # POST: /api/upload (multipart)
│   │       ├── files.ts      # GET/DELETE: /api/files/:id
│   │       ├── health.ts     # GET: /health
│   │       └── ws.ts         # WebSocket echo
│   ├── prisma/
│   │   └── schema.prisma     # Canvas, Node, Edge, File models
│   ├── uploads/              # Uploaded files stored here
│   └── .env
│
├── docs/
│   └── system-design.md
├── run.sh                    # Start all services
└── README.md                 # ← You are here
```

---

## Features

### Canvas (Obsidian-like graph editor)
- **Create nodes** — double-click canvas or use toolbar
- **Edit text** — double-click node label → inline edit → Enter to save
- **Delete nodes** — hover → X button, or select + `Delete`/`Backspace` key
- **Resize nodes** — drag bottom-right grip handle
- **Connect nodes** — drag from source handle (bottom) to target handle (top)
- **Move nodes** — drag anywhere on the node
- **Zoom/Pan** — scroll wheel + drag on canvas
- **Snap to grid** — 16px grid alignment
- **MiniMap** — bottom-right overview
- **Multi-select** — hold `Shift` + click

### Drag & Drop Files
- **Drag any file** from your OS file explorer onto a node
- **GLB/GLTF** → renders interactive 3D model (orbit, zoom, auto-rotate)
- **Images** (png, jpg, gif, webp, svg) → inline preview
- **Video** (mp4, webm, mov) → embedded player with controls
- **Other files** → icon + filename + size display

### Persistence
- **Auto-save** — every change debounced 1s → saves to PostgreSQL
- **Save indicator** — "Saving..." → "✓ Saved" at bottom of canvas
- **Load on mount** — canvas state restored from DB on page load

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/canvas` | List all canvases |
| `GET` | `/api/canvas/:id` | Get canvas with nodes + edges + files |
| `POST` | `/api/canvas` | Create canvas (with nodes/edges) |
| `PUT` | `/api/canvas/:id` | Update canvas (full replace) |
| `DELETE` | `/api/canvas/:id` | Delete canvas (cascade) |
| `POST` | `/api/upload?nodeId=` | Upload file (multipart, max 100MB) |
| `GET` | `/api/files/:id` | Serve uploaded file |
| `DELETE` | `/api/files/:id` | Delete file record |

---

## Database Schema

```
Canvas ──┬── Node[] ──── File[]
         └── Edge[]
```

| Model | Key Fields |
|-------|-----------|
| **Canvas** | `id`, `name`, `createdAt`, `updatedAt` |
| **Node** | `id`, `type`, `positionX/Y`, `width`, `height`, `data` (JSON) |
| **Edge** | `id`, `source`, `target`, `type` |
| **File** | `id`, `filename`, `mimetype`, `path`, `size`, `nodeId` |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React Flow, Zustand, Immer, Three.js (R3F), Tailwind, shadcn/ui, dnd-kit, Framer Motion |
| Backend | Fastify, Prisma 7, PostgreSQL, `@fastify/multipart`, `@fastify/websocket` |
| 3D | Three.js, `@react-three/fiber`, `@react-three/drei` |

---

## Environment Variables

### Backend (`tc-backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3002` | Backend server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `REDIS_HOST` | `127.0.0.1` | Redis host (optional) |
| `REDIS_PORT` | `6379` | Redis port (optional) |

### Frontend (`tc-frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3002` | Backend API base URL |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3000 in use | Next.js auto-picks next port (3001). Update `NEXT_PUBLIC_API_URL` if backend port changes |
| Prisma `PrismaClientOptions` error | Run `npx prisma generate` in `tc-backend/` |
| Redis timeout on startup | Safe to ignore — Redis plugin disabled by default |
| `THREE.WARNING: Multiple instances` | Harmless warning, does not affect functionality |
| CORS errors | Ensure backend CORS `origin` array includes your frontend port |

---

## License

MIT
