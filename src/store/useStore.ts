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

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  deleteSelectedNodes: () => void;
};

export const useStore = create<RFState>()(
  immer((set) => ({
    nodes: [
      {
        id: '1',
        type: 'input',
        data: { label: 'Input Node' },
        position: { x: 250, y: 25 },
      },
      {
        id: '2',
        data: { label: 'Default Node' },
        position: { x: 100, y: 125 },
      },
      {
        id: '3',
        type: 'output',
        data: { label: 'Output Node' },
        position: { x: 250, y: 250 },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    onNodesChange: (changes: NodeChange[]) => {
      set((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes);
      });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
      set((state) => {
        state.edges = applyEdgeChanges(changes, state.edges);
      });
    },
    onConnect: (connection: Connection) => {
      set((state) => {
        state.edges = addEdge(connection, state.edges);
      });
    },
    addNode: (type: string, position: { x: number; y: number }) => {
      const id = crypto.randomUUID();
      const newNode: Node = {
        id,
        type,
        position,
        data: { label: `${type} node` },
      };
      set((state) => {
        state.nodes.push(newNode);
      });
    },
    deleteNode: (id: string) => {
      set((state) => {
        state.nodes = state.nodes.filter((node) => node.id !== id);
        state.edges = state.edges.filter((edge) => edge.source !== id && edge.target !== id);
      });
    },
    deleteSelectedNodes: () => {
      set((state) => {
        const selectedNodeIds = state.nodes
          .filter((node) => node.selected)
          .map((node) => node.id);
        
        state.nodes = state.nodes.filter((node) => !node.selected);
        state.edges = state.edges.filter(
          (edge) => !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
        );
      });
    },
  }))
);
