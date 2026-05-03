import type { ThemeRenderer } from './types';
import { celestialRenderer } from './renderers/celestial';

const renderers = new Map<string, ThemeRenderer>();

renderers.set(celestialRenderer.id, celestialRenderer);

export function getRenderer(id: string): ThemeRenderer {
  const renderer = renderers.get(id);
  if (!renderer) {
    return celestialRenderer;
  }
  return renderer;
}

export function getDefaultRenderer(): ThemeRenderer {
  return celestialRenderer;
}

export function getAllRenderers(): ThemeRenderer[] {
  return Array.from(renderers.values());
}
