export type AchievementCondition =
  | { readonly kind: 'total-nodes-completed'; readonly threshold: number }
  | { readonly kind: 'total-todos-completed'; readonly threshold: number }
  | { readonly kind: 'star-system-all-nodes-completed' }
  | { readonly kind: 'star-systems-created'; readonly threshold: number };

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
