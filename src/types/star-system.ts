import type { ThemeConfig } from './theme';

export interface StarSystem {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly description: string;
  readonly iconStorageKey: string | null;
  readonly themeConfig: ThemeConfig;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
