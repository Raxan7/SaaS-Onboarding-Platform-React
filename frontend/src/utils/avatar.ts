// utils/avatar.ts

import { API_BASE_URL } from './constants';

// Default avatar images to use when custom avatars are not available
const DEFAULT_AVATARS = [
  '/assets/default-avatar-1.png',
  '/assets/default-avatar-2.png',
  '/assets/default-avatar-3.png',
  '/assets/default-avatar-4.png',
];

/**
 * Get avatar URL with proper handling of both remote and local paths
 * @param avatarPath The avatar path or ID
 * @returns A properly formatted avatar URL
 */
export function getAvatarUrl(avatarPath: string | number | null | undefined): string {
  // If no avatar is provided, return a default avatar
  if (!avatarPath) {
    return DEFAULT_AVATARS[0];
  }

  // If the avatar is a number, assume it's an ID and format accordingly
  if (typeof avatarPath === 'number') {
    // Use a default avatar based on the ID to ensure consistency
    return DEFAULT_AVATARS[avatarPath % DEFAULT_AVATARS.length];
  }

  // If avatar path already starts with http, it's already a full URL
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }

  // If avatar path already includes the API_BASE_URL, return as is
  if (avatarPath.includes(API_BASE_URL)) {
    return avatarPath;
  }

  // If avatar path starts with a slash and is a relative path
  if (avatarPath.startsWith('/') && !avatarPath.startsWith('/avatars/')) {
    // It's a local asset, keep it as is
    return avatarPath;
  }

  // Otherwise, assume it's a relative path that needs the API base URL
  // But first check if it's just a number string (like "1.jpg")
  if (/^\d+\.jpg$/.test(avatarPath) || avatarPath.startsWith('/avatars/')) {
    // For paths like "1.jpg" or "/avatars/1.jpg", use default avatars instead
    const id = parseInt(avatarPath.replace(/[^\d]/g, ''), 10) || 0;
    return DEFAULT_AVATARS[id % DEFAULT_AVATARS.length];
  }

  // Finally, prepend API base URL for proper avatar paths
  return `${API_BASE_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
}