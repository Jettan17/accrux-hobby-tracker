export interface TodoItem {
  readonly id: string;
  readonly starSystemId: string;
  readonly parentId: string | null;
  readonly title: string;
  readonly completed: boolean;
  readonly locked: boolean;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
