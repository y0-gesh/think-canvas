'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export const DraggableNode = ({ type }: { type: string }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `draggable-${type}`,
    data: {
      type,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 mb-2 bg-secondary border rounded cursor-grab active:cursor-grabbing hover:bg-secondary/80 transition-colors"
    >
      {type} Node
    </div>
  );
};
