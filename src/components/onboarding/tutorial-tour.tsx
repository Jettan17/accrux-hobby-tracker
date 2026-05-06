'use client';

import { useEffect, useMemo } from 'react';
import { Joyride, STATUS, ACTIONS, type Step, type Placement } from 'react-joyride';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';

function findVisible(attr: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(`[data-tour="${attr}"]`);
  for (const el of els) {
    if (el.offsetParent !== null) return el;
  }
  return null;
}

interface StepBlueprint {
  attr?: string;
  body?: boolean;
  title: string;
  content: string;
  placement?: Placement;
}

const STEPS_BASE: readonly StepBlueprint[] = [
  {
    attr: 'create-system',
    title: 'Create a star system',
    content: 'Each star system is a hobby or area you want to track. Click here to create one.',
    placement: 'right',
  },
  {
    attr: 'edit-system',
    title: 'Customise it',
    content: 'Open the editor to rename, change the description, and pick a colour theme.',
  },
  {
    attr: 'add-todo',
    title: 'Add nodes',
    content: 'Type a task or skill here and press Enter. Each node becomes a planet in your skill tree.',
  },
  {
    attr: 'todo-checkbox',
    title: 'Complete a node',
    content: 'Tick the box to mark a node done. Completed nodes light up in the skill-tree view.',
  },
  {
    attr: 'todo-lock',
    title: 'Lock a node',
    content:
      "Lock nodes you can't tackle yet, or that depend on prerequisites you haven't reached. Locked nodes are also hidden from meteor suggestions.",
  },
  {
    attr: 'text-view',
    title: 'Text view',
    content: 'Edit your whole list as plain text. Indent with spaces for nesting, and prefix lines with [x] to complete or [l] to lock.',
  },
  {
    attr: 'export-system',
    title: 'Export',
    content: 'Download a JSON backup of this star system. Use the gear menu in the top-right to import one back.',
  },
  {
    body: true,
    title: 'Meteors',
    content:
      "On the dashboard, meteors drift across the screen suggesting nodes to work on. They only suggest tasks that aren't completed or locked — another reason to lock things you want hidden.",
  },
  {
    attr: 'achievements',
    title: 'Achievements',
    content: 'Visit the achievements page to see milestones you have unlocked as you build out your star systems.',
  },
];

function buildSteps(): Step[] {
  return STEPS_BASE.map((s): Step => {
    const el = s.body === true || s.attr === undefined ? null : findVisible(s.attr);
    if (s.body === true || el === null) {
      return {
        target: 'body',
        placement: 'center',
        title: s.title,
        content: s.content,
        skipBeacon: true,
      };
    }
    return {
      target: el,
      placement: s.placement ?? 'bottom',
      title: s.title,
      content: s.content,
      skipBeacon: true,
    };
  });
}

export function TutorialTour() {
  const tourRunning = useAppStore((s) => s.tourRunning);
  const tourStepIndex = useAppStore((s) => s.tourStepIndex);
  const setTourStepIndex = useAppStore((s) => s.setTourStepIndex);
  const completeTour = useAppStore((s) => s.completeTour);
  const initTourFromStorage = useAppStore((s) => s.initTourFromStorage);
  const pathname = usePathname();

  useEffect(() => {
    initTourFromStorage();
  }, [initTourFromStorage]);

  const steps = useMemo<Step[]>(() => {
    if (!tourRunning) return [];
    return buildSteps();
  }, [tourRunning, tourStepIndex, pathname]);

  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={tourRunning}
      stepIndex={tourStepIndex}
      continuous
      locale={{ last: 'Finish' }}
      onEvent={(data) => {
        const { action, index, status, type } = data;

        if (
          status === STATUS.FINISHED ||
          status === STATUS.SKIPPED ||
          action === ACTIONS.CLOSE
        ) {
          completeTour();
          return;
        }

        if (type === 'step:after') {
          if (action === ACTIONS.NEXT) {
            setTourStepIndex(index + 1);
          } else if (action === ACTIONS.PREV) {
            setTourStepIndex(Math.max(0, index - 1));
          }
        }
      }}
      options={{
        backgroundColor: '#18181b',
        textColor: '#f4f4f5',
        primaryColor: '#ffffff',
        arrowColor: '#18181b',
        overlayColor: 'rgba(0, 0, 0, 0.65)',
        spotlightRadius: 8,
        zIndex: 10000,
        showProgress: true,
        buttons: ['back', 'skip', 'primary'],
      }}
      styles={{
        tooltip: {
          borderRadius: 12,
          border: '1px solid #3f3f46',
          padding: 16,
        },
        tooltipContent: {
          fontSize: 14,
          color: '#d4d4d8',
          textAlign: 'left',
        },
        buttonPrimary: {
          backgroundColor: '#ffffff',
          color: '#000000',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          color: '#a1a1aa',
          fontSize: 14,
          marginRight: 8,
        },
        buttonSkip: {
          color: '#71717a',
          fontSize: 14,
        },
      }}
    />
  );
}
