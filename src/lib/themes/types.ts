import type { ThemeConfig, NodeVariant, ColorPalette, EdgeStyleVariant } from '@/types';

export interface NodeRenderProps {
  readonly variant: NodeVariant;
  readonly completed: boolean;
  readonly locked: boolean;
  readonly palette: ColorPalette;
  readonly overlay: ThemeConfig['defaultNodeOverlay'];
}

export interface EdgeRenderProps {
  readonly edgeStyle: EdgeStyleVariant;
  readonly palette: ColorPalette;
  readonly sourceCompleted: boolean;
  readonly targetCompleted: boolean;
}

export interface ThemeRenderer {
  readonly id: string;
  readonly name: string;
  getNodeClasses(props: NodeRenderProps): string;
  getNodeSize(variant: NodeVariant): { width: number; height: number };
  getEdgeStyle(props: EdgeRenderProps): Record<string, string>;
  getEdgeAnimated(props: EdgeRenderProps): boolean;
  getBackgroundStyle(config: ThemeConfig): React.CSSProperties;
}
