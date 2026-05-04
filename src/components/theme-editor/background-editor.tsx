'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import type { BackgroundStyle } from '@/types';
import { BACKGROUND_IMAGE_PRESETS } from '@/lib/themes/presets';
import { ColorPicker } from './color-picker';

interface BackgroundEditorProps {
  background: BackgroundStyle;
  onChange: (background: BackgroundStyle) => void;
}

const BG_KINDS = [
  { value: 'solid' as const, label: 'Solid' },
  { value: 'gradient' as const, label: 'Gradient' },
  { value: 'image' as const, label: 'Image' },
] as const;

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

async function compressImage(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Failed to read image'));
      el.src = objectUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function BackgroundEditor({ background, onChange }: BackgroundEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError(`Image too large (max ${MAX_FILE_BYTES / 1024 / 1024}MB)`);
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const currentOpacity = background.kind === 'image' ? background.opacity : 0.4;
      onChange({ kind: 'image', url: dataUrl, opacity: currentOpacity });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Background</h4>

      <div className="flex gap-1 mb-3">
        {BG_KINDS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              if (value === 'solid') {
                onChange({ kind: 'solid', color: background.kind === 'solid' ? background.color : '#0f0f0f' });
              } else if (value === 'gradient') {
                onChange({
                  kind: 'gradient',
                  colors: background.kind === 'gradient' ? background.colors : ['#1a1a2e', '#0f0f0f'],
                  angle: background.kind === 'gradient' ? background.angle : 180,
                });
              } else {
                onChange({ kind: 'image', url: BACKGROUND_IMAGE_PRESETS[0].url, opacity: 0.4 });
              }
            }}
            className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer ${
              background.kind === value
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {background.kind === 'solid' && (
        <ColorPicker
          label="Color"
          value={background.color}
          onChange={(color) => onChange({ kind: 'solid', color })}
        />
      )}

      {background.kind === 'gradient' && (
        <div className="space-y-2">
          <ColorPicker
            label="Start"
            value={background.colors[0] ?? '#1a1a2e'}
            onChange={(color) =>
              onChange({
                kind: 'gradient',
                colors: [color, background.colors[1] ?? '#0f0f0f'],
                angle: background.angle,
              })
            }
          />
          <ColorPicker
            label="End"
            value={background.colors[1] ?? '#0f0f0f'}
            onChange={(color) =>
              onChange({
                kind: 'gradient',
                colors: [background.colors[0] ?? '#1a1a2e', color],
                angle: background.angle,
              })
            }
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Angle</span>
            <input
              type="range"
              min={0}
              max={360}
              value={background.angle}
              onChange={(e) =>
                onChange({
                  kind: 'gradient',
                  colors: [...background.colors],
                  angle: Number(e.target.value),
                })
              }
              className="flex-1 accent-zinc-400"
            />
            <span className="text-xs text-zinc-500 w-8 text-right">{background.angle}°</span>
          </div>
        </div>
      )}

      {background.kind === 'image' && (
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-1.5">
            {BACKGROUND_IMAGE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onChange({ kind: 'image', url: preset.url, opacity: background.opacity })}
                className={`relative h-12 rounded-md overflow-hidden border transition-all cursor-pointer ${
                  background.url === preset.url
                    ? 'border-white ring-1 ring-white/30'
                    : 'border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 to-transparent">
                  <span className="text-[9px] text-white pb-0.5">{preset.name}</span>
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-zinc-700 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
          >
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                Upload custom image
              </>
            )}
          </button>
          {uploadError && (
            <p className="text-xs text-red-400">{uploadError}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Opacity</span>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={background.opacity}
              onChange={(e) =>
                onChange({ kind: 'image', url: background.url, opacity: Number(e.target.value) })
              }
              className="flex-1 accent-zinc-400"
            />
            <span className="text-xs text-zinc-500 w-8 text-right">{Math.round(background.opacity * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
