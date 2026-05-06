'use client';

import React from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core';
import '@xyflow/react/dist/style.css';

import { useStore } from '@/store/useStore';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';

const Flow = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
  } = useStore();

  const { screenToFlowPosition } = useReactFlow();
  const { setNodeRef } = useDroppable({
    id: 'canvas-drop-target',
  });

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === 'canvas-drop-target') {
      const type = active.data.current?.type;
      
      // We need the mouse position relative to the container.
      // dnd-kit gives us coordinates.
      if (type && event.activatorEvent instanceof MouseEvent) {
        const position = screenToFlowPosition({
          x: event.activatorEvent.clientX,
          y: event.activatorEvent.clientY,
        });
        addNode(type, position);
      }
    }
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="flex size-full overflow-hidden">
        <Sidebar />
        <div ref={setNodeRef} className="grow relative h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background />
            <Controls />
            <Panel position="top-right">
              <Toolbar />
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
