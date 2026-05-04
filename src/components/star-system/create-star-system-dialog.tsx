'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeEditor } from '@/components/theme-editor/theme-editor';
import { useAppStore } from '@/lib/store';
import { DEFAULT_THEME } from '@/lib/themes/presets';
import type { ThemeConfig } from '@/types';

interface CreateStarSystemDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export function CreateStarSystemDialog({ open, onClose, userId }: CreateStarSystemDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(DEFAULT_THEME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStarSystem = useAppStore((s) => s.createStarSystem);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await createStarSystem({
        userId,
        name: name.trim(),
        description: description.trim(),
        themeConfig,
      });
      setName('');
      setDescription('');
      setThemeConfig(DEFAULT_THEME);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create star system');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="New Star System">
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
            Create
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
