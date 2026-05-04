import type { Achievement } from '@/types';

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first-light',
    name: 'First Light',
    description: 'Create your first star system',
    iconName: 'sparkles',
    condition: { kind: 'star-systems-created', threshold: 1 },
  },
  {
    id: 'constellation-builder',
    name: 'Constellation Builder',
    description: 'Create 5 star systems',
    iconName: 'stars',
    condition: { kind: 'star-systems-created', threshold: 5 },
  },

  {
    id: 'ignition',
    name: 'Ignition',
    description: 'Complete your first task',
    iconName: 'flame',
    condition: { kind: 'total-todos-completed', threshold: 1 },
  },
  {
    id: 'orbital-velocity',
    name: 'Orbital Velocity',
    description: 'Complete 10 tasks',
    iconName: 'rocket',
    condition: { kind: 'total-todos-completed', threshold: 10 },
  },
  {
    id: 'escape-velocity',
    name: 'Escape Velocity',
    description: 'Complete 50 tasks',
    iconName: 'zap',
    condition: { kind: 'total-todos-completed', threshold: 50 },
  },
  {
    id: 'hyperdrive',
    name: 'Hyperdrive',
    description: 'Complete 100 tasks',
    iconName: 'atom',
    condition: { kind: 'total-todos-completed', threshold: 100 },
  },

  {
    id: 'supernova',
    name: 'Supernova',
    description: 'Complete every task in a star system',
    iconName: 'sun',
    condition: { kind: 'star-systems-fully-completed', threshold: 1 },
  },
  {
    id: 'galaxy-architect',
    name: 'Galaxy Architect',
    description: 'Fully complete 3 star systems',
    iconName: 'telescope',
    condition: { kind: 'star-systems-fully-completed', threshold: 3 },
  },

  {
    id: 'cartographer',
    name: 'Cartographer',
    description: 'Export your first backup',
    iconName: 'map',
    condition: { kind: 'has-exported' },
  },
  {
    id: 'personal-touch',
    name: 'Personal Touch',
    description: 'Upload a custom background image',
    iconName: 'image',
    condition: { kind: 'has-custom-image' },
  },
  {
    id: 'branching-out',
    name: 'Branching Out',
    description: 'Nest a task three levels deep',
    iconName: 'git-branch',
    condition: { kind: 'todo-nesting-depth', threshold: 3 },
  },
  {
    id: 'constellation',
    name: 'Constellation',
    description: 'Have ten tasks in a single star system',
    iconName: 'network',
    condition: { kind: 'todos-in-single-system', threshold: 10 },
  },
  {
    id: 'polymath',
    name: 'Polymath',
    description: 'Have three star systems each with 10+ completed tasks',
    iconName: 'graduation-cap',
    condition: { kind: 'systems-with-completed-todos', minSystems: 3, completedThreshold: 10 },
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    description: 'Use five different theme colors across your systems',
    iconName: 'palette',
    condition: { kind: 'distinct-theme-colors', threshold: 5 },
  },
  {
    id: 'power-hour',
    name: 'Power Hour',
    description: 'Complete five tasks within an hour',
    iconName: 'timer',
    condition: { kind: 'todos-in-window', threshold: 5, windowMs: 60 * 60 * 1000 },
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Complete ten tasks in a single day',
    iconName: 'medal',
    condition: { kind: 'todos-in-window', threshold: 10, windowMs: 24 * 60 * 60 * 1000 },
  },
];

export const ACHIEVEMENTS_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
