import type { ElectionType } from '../data/types';

/**
 * The election goals the platform is organized around. The user picks a
 * goal ("elect one person", "elect N in order", ...); each goal maps to the
 * counting method (election system) that achieves it. The method is an
 * implementation detail and is only shown as secondary information.
 */
export type GoalId = 'single' | 'ordered' | 'multi' | 'parity';

export interface ElectionGoal {
  id: GoalId;
  /** the counting method used to achieve this goal */
  systemId: ElectionType;
  /** i18n keys */
  titleKey: string;
  descKey: string;
  exampleKey: string;
  /** optional i18n key with the technical note about the underlying method */
  noteKey?: string;
}

export const goals: ElectionGoal[] = [
  {
    id: 'single',
    systemId: 'schulze',
    titleKey: 'goal.single.title',
    descKey: 'goal.single.desc',
    exampleKey: 'goal.single.example',
    noteKey: 'goal.single.note',
  },
  {
    id: 'ordered',
    systemId: 'stv-md-coperland',
    titleKey: 'goal.ordered.title',
    descKey: 'goal.ordered.desc',
    exampleKey: 'goal.ordered.example',
    noteKey: 'goal.ordered.note',
  },
  {
    id: 'multi',
    systemId: 'stv-md',
    titleKey: 'goal.multi.title',
    descKey: 'goal.multi.desc',
    exampleKey: 'goal.multi.example',
  },
  {
    id: 'parity',
    systemId: 'stv-md-grouped',
    titleKey: 'goal.parity.title',
    descKey: 'goal.parity.desc',
    exampleKey: 'goal.parity.example',
    noteKey: 'goal.parity.note',
  },
];

/** Look up a goal by its URL/registry id (e.g. the ?goal= query param). */
export function getGoal(id: string | null | undefined): ElectionGoal | undefined {
  if (!id) return undefined;
  return goals.find(g => g.id === id);
}

/** The goal achieved by a given counting method. */
export function getGoalBySystemId(systemId: ElectionType): ElectionGoal {
  const goal = goals.find(g => g.systemId === systemId);
  if (!goal) throw new Error(`No goal mapped for election system '${systemId}'`);
  return goal;
}
