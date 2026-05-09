import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getFileUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('http:') || url.startsWith('https:')) {
    return url;
  }
  
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  // Ensure we don't have double slashes
  const cleanBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  return `${cleanBase}${cleanUrl}`;
}
