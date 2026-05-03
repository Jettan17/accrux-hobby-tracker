export type BackgroundStyle =
  | { readonly kind: 'solid'; readonly color: string }
  | { readonly kind: 'gradient'; readonly colors: readonly string[]; readonly angle: number }
  | { readonly kind: 'image'; readonly storageKey: string; readonly opacity: number };

export type NodeShapeVariant = 'circle' | 'hexagon' | 'irregular';

export type NodeOverlay =
  | { readonly kind: 'none' }
  | { readonly kind: 'glyph'; readonly character: string; readonly fontFamily?: string }
  | { readonly kind: 'icon'; readonly lucideIconName: string }
  | { readonly kind: 'image'; readonly storageKey: string };

export type EdgeStyleVariant = 'constellation' | 'solid' | 'rope' | 'branch';

export interface ColorPalette {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
}

export interface ThemeConfig {
  readonly background: BackgroundStyle;
  readonly nodeShape: NodeShapeVariant;
  readonly defaultNodeOverlay: NodeOverlay;
  readonly edgeStyle: EdgeStyleVariant;
  readonly palette: ColorPalette;
}
