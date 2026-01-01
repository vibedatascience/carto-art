'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PosterConfig, SavedProject } from '@/types/poster';
import { safeGetItem, safeSetItem } from '@/lib/storage/safeStorage';
import { logger } from '@/lib/logger';

const STORAGE_KEY = 'carto-art-saved-projects';

/**
 * Hook for managing saved poster projects in localStorage.
 * Provides CRUD operations with error handling for storage failures.
 * 
 * @returns Object containing:
 * - projects: Array of saved projects
 * - saveProject: Save a new project
 * - deleteProject: Delete a project by ID
 * - renameProject: Rename a project
 * - isLoaded: Whether projects have been loaded from storage
 * - storageError: Error message if storage operations fail
 * 
 * @example
 * ```tsx
 * const { projects, saveProject, deleteProject } = useSavedProjects();
 * saveProject('My Poster', currentConfig);
 * ```
 */
export function useSavedProjects() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = safeGetItem(STORAGE_KEY);
    if (stored) {
      try {
        setProjects(JSON.parse(stored));
      } catch (e) {
        logger.error('Failed to parse saved projects', e);
        setStorageError('Failed to load saved projects');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      const success = safeSetItem(STORAGE_KEY, JSON.stringify(projects));
      if (!success) {
        setStorageError('Failed to save projects. Storage may be full or unavailable.');
      } else {
        setStorageError(null);
      }
    }
  }, [projects, isLoaded]);

  const saveProject = useCallback((name: string, config: PosterConfig) => {
    const newProject: SavedProject = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      name,
      config,
      updatedAt: Date.now(),
    };
    setProjects(prev => [newProject, ...prev]);
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const renameProject = useCallback((id: string, name: string) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, name, updatedAt: Date.now() } : p
    ));
  }, []);

  return {
    projects,
    saveProject,
    deleteProject,
    renameProject,
    isLoaded,
    storageError
  };
}

