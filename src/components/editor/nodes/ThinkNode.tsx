'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Handle,
  Position,
  NodeResizeControl,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import { X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Model3DViewer } from './Model3DViewer';
import { FilePreview } from './FilePreview';

export type ThinkNodeData = {
  label: string;
  attachments?: FileAttachment[];
  width?: number;
  height?: number;
};

export type FileAttachment = {
  id: string;
  name: string;
  type: string; // MIME type
  url: string;  // blob URL or server URL
  size?: number;
};

type ThinkNodeType = Node<ThinkNodeData, 'think'>;

const MIN_WIDTH = 180;
const MIN_HEIGHT = 100;
const DEFAULT_WIDTH = 220;
const DEFAULT_HEIGHT = 140;

export const ThinkNode = ({ id, data, selected }: NodeProps<ThinkNodeType>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data.label || 'Untitled');
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { updateNodeLabel, deleteNode, attachFileToNode } = useStore();

  const width = data.width || DEFAULT_WIDTH;
  const height = data.height || DEFAULT_HEIGHT;

  // Sync label from store
  useEffect(() => {
    setLabelValue(data.label || 'Untitled');
  }, [data.label]);

  // Focus input on edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const commitLabel = useCallback(() => {
    setIsEditing(false);
    const trimmed = labelValue.trim() || 'Untitled';
    setLabelValue(trimmed);
    updateNodeLabel(id, trimmed);
  }, [id, labelValue, updateNodeLabel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitLabel();
      }
      if (e.key === 'Escape') {
        setLabelValue(data.label || 'Untitled');
        setIsEditing(false);
      }
    },
    [commitLabel, data.label],
  );

  // ── Native file drop ──
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      files.forEach((file) => {
        const attachment: FileAttachment = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type || 'application/octet-stream',
          url: URL.createObjectURL(file),
          size: file.size,
        };
        attachFileToNode(id, attachment);
      });
    },
    [id, attachFileToNode],
  );

  const attachments = data.attachments || [];
  const hasAttachments = attachments.length > 0;

  // Determine primary attachment type for rendering
  const primaryAttachment = attachments[0];
  const is3D = primaryAttachment?.name?.match(/\.(glb|gltf)$/i);
  const isImage = primaryAttachment?.type?.startsWith('image/');
  const isVideo = primaryAttachment?.type?.startsWith('video/');

  return (
    <div
      className={cn(
        'think-node group relative',
        selected && 'think-node--selected',
        isDragOver && 'think-node--dragover',
      )}
      style={{ width, minHeight: height }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── Resize control ── */}
      <NodeResizeControl
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        style={{ background: 'transparent', border: 'none' }}
      >
        <GripVertical
          size={12}
          className="absolute bottom-1 right-1 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </NodeResizeControl>

      {/* ── Handles ── */}
      <Handle type="target" position={Position.Top} className="think-handle" />
      <Handle type="source" position={Position.Bottom} className="think-handle" />

      {/* ── Delete button ── */}
      <button
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          deleteNode(id);
        }}
      >
        <X size={10} />
      </button>

      {/* ── Header / Label ── */}
      <div className="think-node__header" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <input
            ref={inputRef}
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={handleKeyDown}
            className="think-node__input"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="think-node__label">{data.label || 'Untitled'}</span>
        )}
      </div>

      {/* ── Content area ── */}
      <div className="think-node__content">
        {hasAttachments ? (
          <div className="think-node__attachments">
            {is3D && primaryAttachment ? (
              <Model3DViewer
                url={primaryAttachment.url}
                width={width - 16}
                height={Math.max(height - 60, 100)}
              />
            ) : isImage && primaryAttachment ? (
              <FilePreview attachment={primaryAttachment} type="image" />
            ) : isVideo && primaryAttachment ? (
              <FilePreview attachment={primaryAttachment} type="video" />
            ) : primaryAttachment ? (
              <FilePreview attachment={primaryAttachment} type="file" />
            ) : null}

            {attachments.length > 1 && (
              <div className="think-node__attachment-count">
                +{attachments.length - 1} more
              </div>
            )}
          </div>
        ) : (
          <div className="think-node__dropzone">
            <p className="text-xs text-zinc-500">
              {isDragOver ? 'Drop file here' : 'Drag files here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
