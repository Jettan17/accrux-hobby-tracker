'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeEditor } from '@/components/theme-editor/theme-editor';
import { useAppStore } from '@/lib/store';
import type { StarSystem, ThemeConfig } from '@/types';

interface EditStarSystemDialogProps {
  open: boolean;
  onClose: () => void;
  system: StarSystem;
}

export function EditStarSystemDialog({ open, onClose, system }: EditStarSystemDialogProps) {
  const [name, setName] = useState(system.name);
  const [description, setDescription] = useState(system.description);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(system.themeConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStarSystem = useAppStore((s) => s.updateStarSystem);

  useEffect(() => {
    if (open) {
      setName(system.name);
      setDescription(system.description);
      setThemeConfig(system.themeConfig);
      setError(null);
    }
  }, [open, system]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await updateStarSystem(system.id, {
        name: name.trim(),
        description: description.trim(),
        themeConfig,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update star system');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit Star System">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          placeholder="e.g. Programming, Climbing, Languages"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <Input
          label="Description"
          placeholder="What's this hobby about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <ThemeEditor themeConfig={themeConfig} onChange={setThemeConfig} />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!name.trim()}>
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
