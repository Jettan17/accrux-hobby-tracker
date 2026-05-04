export type AchievementCondition =
  | { readonly kind: 'star-systems-created'; readonly threshold: number }
  | { readonly kind: 'total-todos-completed'; readonly threshold: number }
  | { readonly kind: 'star-systems-fully-completed'; readonly threshold: number }
  | { readonly kind: 'todos-in-window'; readonly threshold: number; readonly windowMs: number }
  | { readonly kind: 'todo-nesting-depth'; readonly threshold: number }
  | { readonly kind: 'todos-in-single-system'; readonly threshold: number }
  | { readonly kind: 'systems-with-completed-todos'; readonly minSystems: number; readonly completedThreshold: number }
  | { readonly kind: 'distinct-theme-colors'; readonly threshold: number }
  | { readonly kind: 'has-exported' }
  | { readonly kind: 'has-custom-image' };

export interface Achievement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly iconName: string;
  readonly condition: AchievementCondition;
}

export interface UserAchievement {
  readonly id: string;
  readonly userId: string;
  readonly achievementId: string;
  readonly unlockedAt: string;
}
