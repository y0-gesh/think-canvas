'use client';

import React from 'react';
import { DraggableNode } from './DraggableNode';

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r bg-muted/30 p-4 flex flex-col gap-4">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
        Node Types
      </h3>
      <div className="flex flex-col">
        <DraggableNode type="default" />
        <DraggableNode type="input" />
        <DraggableNode type="output" />
      </div>
      <div className="mt-auto text-xs text-muted-foreground">
        Drag a node onto the canvas to add it.
      </div>
    </aside>
  );
};
