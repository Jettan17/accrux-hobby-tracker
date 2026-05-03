export type NodeVariant = 'gas-giant' | 'asteroid' | 'moon';

export type NodeStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export interface SkillNode {
  readonly id: string;
  readonly starSystemId: string;
  readonly label: string;
  readonly description: string;
  readonly variant: NodeVariant;
  readonly completed: boolean;
  readonly positionX: number;
  readonly positionY: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
