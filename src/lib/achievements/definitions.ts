import type { Achievement } from '@/types';

export const ACHIEVEMENTS: readonly Achievement[] = [
  // Star system creation milestones
  {
    id: 'first-light',
    name: 'First Light',
    description: 'Create your first star system',
    iconName: 'sparkles',
    condition: { kind: 'star-systems-created', threshold: 1 },
  },
  {
    id: 'binary-star',
    name: 'Binary Star',
    description: 'Create 2 star systems',
    iconName: 'orbit',
    condition: { kind: 'star-systems-created', threshold: 2 },
  },
  {
    id: 'constellation-builder',
    name: 'Constellation Builder',
    description: 'Create 5 star systems',
    iconName: 'stars',
    condition: { kind: 'star-systems-created', threshold: 5 },
  },
  {
    id: 'galaxy-architect',
    name: 'Galaxy Architect',
    description: 'Create 7 star systems',
    iconName: 'telescope',
    condition: { kind: 'star-systems-created', threshold: 7 },
  },

  // Node completion milestones
  {
    id: 'ignition',
    name: 'Ignition',
    description: 'Complete your first skill node',
    iconName: 'flame',
    condition: { kind: 'total-nodes-completed', threshold: 1 },
  },
  {
    id: 'orbital-velocity',
    name: 'Orbital Velocity',
    description: 'Complete 5 skill nodes',
    iconName: 'rocket',
    condition: { kind: 'total-nodes-completed', threshold: 5 },
  },
  {
    id: 'escape-velocity',
    name: 'Escape Velocity',
    description: 'Complete 10 skill nodes',
    iconName: 'zap',
    condition: { kind: 'total-nodes-completed', threshold: 10 },
  },
  {
    id: 'lightspeed',
    name: 'Lightspeed',
    description: 'Complete 25 skill nodes',
    iconName: 'bolt',
    condition: { kind: 'total-nodes-completed', threshold: 25 },
  },
  {
    id: 'warp-drive',
    name: 'Warp Drive',
    description: 'Complete 50 skill nodes',
    iconName: 'gauge',
    condition: { kind: 'total-nodes-completed', threshold: 50 },
  },
  {
    id: 'hyperdrive',
    name: 'Hyperdrive',
    description: 'Complete 100 skill nodes',
    iconName: 'atom',
    condition: { kind: 'total-nodes-completed', threshold: 100 },
  },

  // Todo completion milestones
  {
    id: 'mission-log',
    name: 'Mission Log',
    description: 'Complete your first todo',
    iconName: 'clipboard-check',
    condition: { kind: 'total-todos-completed', threshold: 1 },
  },
  {
    id: 'mission-control',
    name: 'Mission Control',
    description: 'Complete 10 todos',
    iconName: 'list-checks',
    condition: { kind: 'total-todos-completed', threshold: 10 },
  },
  {
    id: 'ground-control',
    name: 'Ground Control',
    description: 'Complete 25 todos',
    iconName: 'radio-tower',
    condition: { kind: 'total-todos-completed', threshold: 25 },
  },
  {
    id: 'command-center',
    name: 'Command Center',
    description: 'Complete 50 todos',
    iconName: 'monitor',
    condition: { kind: 'total-todos-completed', threshold: 50 },
  },
  {
    id: 'starfleet-ops',
    name: 'Starfleet Ops',
    description: 'Complete 100 todos',
    iconName: 'shield-check',
    condition: { kind: 'total-todos-completed', threshold: 100 },
  },

  // Full star system completion
  {
    id: 'supernova',
    name: 'Supernova',
    description: 'Complete all nodes in a star system',
    iconName: 'sun',
    condition: { kind: 'star-system-all-nodes-completed' },
  },
];

export const ACHIEVEMENTS_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
