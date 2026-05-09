import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import type { FileAttachment, ThinkNodeData } from '@/components/editor/nodes/ThinkNode';

// ── API config ──
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

type RFState = {
  // Canvas metadata
  canvasId: string | null;
  canvasName: string;
  isSaving: boolean;
  lastSaved: Date | null;

  // Graph data
  nodes: Node<ThinkNodeData>[];
  edges: Edge[];

  // ReactFlow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Node CRUD
  addNode: (type: string, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  deleteSelectedNodes: () => void;

  // Node data mutations
  updateNodeLabel: (id: string, label: string) => void;
  updateNodeSize: (id: string, width: number, height: number) => void;
  attachFileToNode: (id: string, attachment: FileAttachment) => void;
  removeAttachment: (nodeId: string, attachmentId: string) => void;

  // Persistence
  saveCanvas: () => Promise<void>;
  loadCanvas: (id?: string) => Promise<void>;
  createCanvas: (name: string) => Promise<void>;
};

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

const debouncedSave = (saveFn: () => Promise<void>) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveFn();
  }, 1000);
};

export const useStore = create<RFState>()(
  immer((set, get) => ({
    canvasId: null,
    canvasName: 'Untitled Canvas',
    isSaving: false,
    lastSaved: null,

    nodes: [
      {
        id: '1',
        type: 'think',
        data: { label: 'Welcome to ThinkCanvas' },
        position: { x: 250, y: 25 },
      },
      {
        id: '2',
        type: 'think',
        data: { label: 'Drop files here' },
        position: { x: 100, y: 200 },
      },
      {
        id: '3',
        type: 'think',
        data: { label: 'Connect ideas' },
        position: { x: 400, y: 200 },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
    ],

    onNodesChange: (changes: NodeChange[]) => {
      set((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes) as Node<ThinkNodeData>[];
      });
      debouncedSave(get().saveCanvas);
    },

    onEdgesChange: (changes: EdgeChange[]) => {
      set((state) => {
        state.edges = applyEdgeChanges(changes, state.edges);
      });
      debouncedSave(get().saveCanvas);
    },

    onConnect: (connection: Connection) => {
      set((state) => {
        state.edges = addEdge(connection, state.edges);
      });
      debouncedSave(get().saveCanvas);
    },

    addNode: (type: string, position: { x: number; y: number }) => {
      const id = crypto.randomUUID();
      const newNode: Node<ThinkNodeData> = {
        id,
        type: 'think',
        position,
        data: { label: `${type} node` },
      };
      set((state) => {
        state.nodes.push(newNode);
      });
      debouncedSave(get().saveCanvas);
    },

    deleteNode: (id: string) => {
      set((state) => {
        state.nodes = state.nodes.filter((node) => node.id !== id);
        state.edges = state.edges.filter((edge) => edge.source !== id && edge.target !== id);
      });
      debouncedSave(get().saveCanvas);
    },

    deleteSelectedNodes: () => {
      set((state) => {
        const selectedNodeIds = state.nodes
          .filter((node) => node.selected)
          .map((node) => node.id);

        state.nodes = state.nodes.filter((node) => !node.selected);
        state.edges = state.edges.filter(
          (edge) => !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target),
        );
      });
      debouncedSave(get().saveCanvas);
    },

    updateNodeLabel: (id: string, label: string) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === id);
        if (node) {
          node.data = { ...node.data, label };
        }
      });
      debouncedSave(get().saveCanvas);
    },

    updateNodeSize: (id: string, width: number, height: number) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === id);
        if (node) {
          node.data = { ...node.data, width, height };
        }
      });
      debouncedSave(get().saveCanvas);
    },

    attachFileToNode: (id: string, attachment: FileAttachment) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === id);
        if (node) {
          const existing = node.data.attachments || [];
          node.data = {
            ...node.data,
            attachments: [...existing, attachment],
          };
        }
      });
      debouncedSave(get().saveCanvas);
    },

    removeAttachment: (nodeId: string, attachmentId: string) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (node && node.data.attachments) {
          node.data = {
            ...node.data,
            attachments: node.data.attachments.filter((a) => a.id !== attachmentId),
          };
        }
      });
      debouncedSave(get().saveCanvas);
    },

    // ── Persistence ──
    saveCanvas: async () => {
      const state = get();
      if (!state.canvasId) {
        // Auto-create canvas on first save
        await state.createCanvas(state.canvasName);
        return;
      }

      set({ isSaving: true });

      try {
        const payload = {
          name: state.canvasName,
          nodes: state.nodes.map((n) => ({
            id: n.id,
            type: n.type || 'think',
            positionX: n.position.x,
            positionY: n.position.y,
            width: n.data.width || 220,
            height: n.data.height || 140,
            data: n.data,
          })),
          edges: state.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type || 'default',
          })),
        };

        await fetch(`${API_BASE}/api/canvas/${state.canvasId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        set({ isSaving: false, lastSaved: new Date() });
      } catch (err) {
        console.error('Save failed:', err);
        set({ isSaving: false });
      }
    },

    loadCanvas: async (id?: string) => {
      try {
        // If no ID, try to get the first canvas or create one
        if (!id) {
          const res = await fetch(`${API_BASE}/api/canvas`);
          if (!res.ok) return;
          const canvases = await res.json();
          if (canvases.length === 0) return; // Will create on first save
          id = canvases[0].id;
        }

        const res = await fetch(`${API_BASE}/api/canvas/${id}`);
        if (!res.ok) return;
        const canvas = await res.json();

        set((state) => {
          state.canvasId = canvas.id;
          state.canvasName = canvas.name;
          state.nodes = canvas.nodes.map((n: any) => ({
            id: n.id,
            type: n.type || 'think',
            position: { x: n.positionX, y: n.positionY },
            data: n.data || { label: 'Untitled' },
          }));
          state.edges = canvas.edges.map((e: any) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type || 'default',
          }));
        });
      } catch (err) {
        console.error('Load failed:', err);
      }
    },

    createCanvas: async (name: string) => {
      try {
        const state = get();
        const payload = {
          name,
          nodes: state.nodes.map((n) => ({
            id: n.id,
            type: n.type || 'think',
            positionX: n.position.x,
            positionY: n.position.y,
            width: n.data.width || 220,
            height: n.data.height || 140,
            data: n.data,
          })),
          edges: state.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type || 'default',
          })),
        };

        const res = await fetch(`${API_BASE}/api/canvas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const canvas = await res.json();
          set({ canvasId: canvas.id, lastSaved: new Date() });
        }
      } catch (err) {
        console.error('Create canvas failed:', err);
      }
    },
  })),
);
