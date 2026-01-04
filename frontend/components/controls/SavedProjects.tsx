'use client';

import { useState } from 'react';
import { Save, Trash2, FolderOpen, Edit2, Check, X } from 'lucide-react';
import type { PosterConfig, SavedProject } from '@/types/poster';
import { ControlSection } from '@/components/ui/control-components';

interface SavedProjectsProps {
  projects: SavedProject[];
  currentConfig: PosterConfig;
  onSave: (name: string, config: PosterConfig, thumbnailBlob?: Blob) => Promise<void>;
  onLoad: (project: SavedProject) => void;
  onDelete: (id: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
}

export function SavedProjects({
  projects,
  currentConfig,
  onSave,
  onLoad,
  onDelete,
  onRename
}: SavedProjectsProps) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || saving) return;

    setSaving(true);
    setError(null);
    try {
      await onSave(newName.trim(), currentConfig);
      setNewName('');
    } catch (err: any) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim() || renamingId === id) return;

    setRenamingId(id);
    setError(null);
    try {
      await onRename(id, editName.trim());
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to rename.');
    } finally {
      setRenamingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?') || deletingId === id) return;

    setDeletingId(id);
    setError(null);
    try {
      await onDelete(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (project: SavedProject) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  return (
    <div className="space-y-4">
      <ControlSection title="Save">
        {error && (
          <p className="text-[10px] text-red-500 dark:text-red-400 mb-2">{error}</p>
        )}
        <form onSubmit={handleSave} className="flex gap-1.5">
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError(null);
            }}
            placeholder="Name..."
            className="flex-1 px-2 py-1.5 text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-gray-400 disabled:opacity-50"
            disabled={saving}
          />
          <button
            type="submit"
            disabled={!newName.trim() || saving}
            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
      </ControlSection>

      <ControlSection title={`Library (${projects.length})`}>
        {projects.length === 0 ? (
          <div className="text-center py-4 text-gray-400 dark:text-gray-500">
            <FolderOpen className="w-5 h-5 mx-auto mb-1 opacity-40" />
            <p className="text-[10px]">No saved projects</p>
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group flex items-center gap-2 py-1.5 px-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => !editingId && onLoad(project)}
              >
                <div className="flex-1 min-w-0">
                  {editingId === project.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(project.id)}
                        className="flex-1 px-1.5 py-0.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none"
                        disabled={renamingId === project.id}
                      />
                      <button
                        onClick={() => handleRename(project.id)}
                        className="p-0.5 text-gray-500 hover:text-green-600"
                        disabled={renamingId === project.id}
                      >
                        {renamingId === project.id ? (
                          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setError(null);
                        }}
                        className="p-0.5 text-gray-500 hover:text-red-600"
                        disabled={renamingId === project.id}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{project.name}</p>
                      <p className="text-[9px] text-gray-400 dark:text-gray-500">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>

                {editingId !== project.id && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => startEditing(project)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      disabled={deletingId === project.id}
                    >
                      {deletingId === project.id ? (
                        <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ControlSection>
    </div>
  );
}

