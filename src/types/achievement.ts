export type AchievementCondition =
  | { readonly kind: 'star-systems-created'; readonly threshold: number }
  | { readonly kind: 'total-todos-completed'; readonly threshold: number }
  | { readonly kind: 'star-systems-fully-completed'; readonly threshold: number }
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
