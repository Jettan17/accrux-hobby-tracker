import type { StateCreator } from 'zustand';
import type { AppState } from './index';

const STORAGE_KEY = 'accrux:tutorial:completed';

export interface TutorialSlice {
  tourRunning: boolean;
  tourStepIndex: number;
  tourCompleted: boolean;

  startTour: () => void;
  stopTour: () => void;
  setTourStepIndex: (index: number) => void;
  completeTour: () => void;
  initTourFromStorage: () => void;
}

export const createTutorialSlice: StateCreator<AppState, [], [], TutorialSlice> = (set) => ({
  tourRunning: false,
  tourStepIndex: 0,
  tourCompleted: false,

  startTour: () => set({ tourRunning: true, tourStepIndex: 0 }),
  stopTour: () => set({ tourRunning: false }),
  setTourStepIndex: (index) => set({ tourStepIndex: index }),
  completeTour: () => {
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    }
    set({ tourRunning: false, tourCompleted: true, tourStepIndex: 0 });
  },
  initTourFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const flag = window.localStorage.getItem(STORAGE_KEY);
      set({ tourCompleted: flag === '1' });
    } catch {}
  },
});
