'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import type { StarSystem } from '@/types';

interface DeleteStarSystemDialogProps {
  open: boolean;
  onClose: () => void;
  system: StarSystem;
}

export function DeleteStarSystemDialog({ open, onClose, system }: DeleteStarSystemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteStarSystem = useAppStore((s) => s.deleteStarSystem);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    try {
      await deleteStarSystem(system.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete star system');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Delete Star System">
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Are you sure you want to delete <span className="font-medium text-white">{system.name}</span>?
          This will permanently remove all skill nodes, edges, and todos in this star system.
        </p>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
