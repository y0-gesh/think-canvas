'use client';

import React from 'react';
import { FileText, Film, ImageIcon, File } from 'lucide-react';
import type { FileAttachment } from './ThinkNode';

interface FilePreviewProps {
  attachment: FileAttachment;
  type: 'image' | 'video' | 'file';
}

export const FilePreview = ({ attachment, type }: FilePreviewProps) => {
  if (type === 'image') {
    return (
      <div className="file-preview file-preview--image">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="file-preview__img"
          draggable={false}
        />
        <span className="file-preview__name">{attachment.name}</span>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className="file-preview file-preview--video">
        <video
          src={attachment.url}
          controls
          className="file-preview__video"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <span className="file-preview__name">
          <Film size={12} className="inline mr-1" />
          {attachment.name}
        </span>
      </div>
    );
  }

  // Generic file
  const ext = attachment.name.split('.').pop()?.toLowerCase() || '';
  const sizeKB = attachment.size ? (attachment.size / 1024).toFixed(1) : '?';

  const IconComponent =
    ext === 'pdf' ? FileText
    : ['doc', 'docx', 'txt', 'md'].includes(ext) ? FileText
    : ['mp4', 'webm', 'mov'].includes(ext) ? Film
    : ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) ? ImageIcon
    : File;

  return (
    <div className="file-preview file-preview--generic">
      <div className="file-preview__icon-wrap">
        <IconComponent size={24} />
      </div>
      <div className="file-preview__info">
        <span className="file-preview__name">{attachment.name}</span>
        <span className="file-preview__size">{sizeKB} KB</span>
      </div>
    </div>
  );
};
