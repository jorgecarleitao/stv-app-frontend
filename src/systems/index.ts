import type { ElectionType } from '../data/types';
import type { ElectionSystemUI } from './types';
import StvMd from './stvMd';
import StvMdCoperland from './stvMdCoperland';
import StvMdGrouped from './stvMdGrouped';
import Schulze from './schulze';

/**
 * Registry of all supported election systems. Adding a new system means
 * adding one module in this directory plus one entry here.
 */
export const systems: Record<ElectionType, ElectionSystemUI> = {
  'stv-md': StvMd,
  'stv-md-coperland': StvMdCoperland,
  'stv-md-grouped': StvMdGrouped,
  schulze: Schulze,
};

export function getSystem(type: ElectionType): ElectionSystemUI {
  return systems[type];
}

export type { ElectionSystemUI } from './types';
export * from './goals';
