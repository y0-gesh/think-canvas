'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  type NodeTypes,
} from '@xyflow/react';
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core';
import '@xyflow/react/dist/style.css';

import { useStore } from '@/store/useStore';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { ThinkNode } from './nodes/ThinkNode';

const nodeTypes: NodeTypes = {
  think: ThinkNode,
};

const SaveIndicator = () => {
  const { isSaving, lastSaved } = useStore();

  return (
    <div className="save-indicator">
      {isSaving ? (
        <span className="save-indicator__saving">
          <span className="save-indicator__dot" />
          Saving...
        </span>
      ) : lastSaved ? (
        <span className="save-indicator__saved">
          ✓ Saved
        </span>
      ) : null}
    </div>
  );
};

const Flow = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    loadCanvas,
  } = useStore();

  const { screenToFlowPosition } = useReactFlow();
  const { setNodeRef } = useDroppable({
    id: 'canvas-drop-target',
  });

  // Load canvas from DB on mount
  useEffect(() => {
    loadCanvas();
  }, [loadCanvas]);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && over.id === 'canvas-drop-target') {
        const type = active.data.current?.type;

        if (type && event.activatorEvent instanceof MouseEvent) {
          const position = screenToFlowPosition({
            x: event.activatorEvent.clientX,
            y: event.activatorEvent.clientY,
          });
          addNode(type, position);
        }
      }
    },
    [screenToFlowPosition, addNode],
  );

  // Double-click on canvas → create new node
  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode('think', position);
    },
    [screenToFlowPosition, addNode],
  );

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="flex size-full overflow-hidden">
        <Sidebar />
        <div ref={setNodeRef} className="grow relative h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={() => {}}
            onDoubleClick={onPaneDoubleClick}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
            deleteKeyCode={['Backspace', 'Delete']}
            multiSelectionKeyCode="Shift"
            className="think-canvas"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="rgba(255,255,255,0.05)"
            />
            <Controls className="think-controls" />
            <Panel position="top-right">
              <Toolbar />
            </Panel>
            <Panel position="bottom-center">
              <SaveIndicator />
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </DndContext>
  );
};

export const Canvas = () => (
  <ReactFlowProvider>
    <Flow />
  </ReactFlowProvider>
);
