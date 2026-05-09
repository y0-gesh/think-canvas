'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/vendors/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export const Toolbar = () => {
  const { addNode, deleteSelectedNodes } = useStore();

  return (
    <div className="flex gap-2 p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-md">
      <Button
        variant="outline"
        size="sm"
        onClick={() => addNode('default', { x: Math.random() * 400, y: Math.random() * 400 })}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Node
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={deleteSelectedNodes}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Selected
      </Button>
    </div>
  );
};
