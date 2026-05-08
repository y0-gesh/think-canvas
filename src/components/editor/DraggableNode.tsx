'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
  Type, 
  Download, 
  Upload, 
  Eye, 
  Box, 
  Cpu 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableNodeProps {
  type: string;
}

const nodeInfo: Record<string, { label: string; icon: any }> = {
  prompt: { label: 'Prompt', icon: Type },
  import: { label: 'Import', icon: Download },
  export: { label: 'Export', icon: Upload },
  preview: { label: 'Preview', icon: Eye },
  model: { label: 'Import Model', icon: Box },
  lora: { label: 'Import LoRA', icon: Cpu },
};

export const DraggableNode = ({ type }: DraggableNodeProps) => {
  const info = nodeInfo[type] || { label: type, icon: Box };
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: { type },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex flex-col items-center justify-center p-4 bg-accent rounded-lg cursor-grab active:cursor-grabbing transition-colors group",
        isDragging && "opacity-50"
      )}
    >
      <info.icon size={24} className="mb-2 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
      <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors text-center uppercase tracking-tight">
        {info.label}
      </span>
    </div>
  );
};
