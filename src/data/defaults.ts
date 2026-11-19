import { Election, ElectionType } from './types';

export const DEFAULT_ELECTION: Election = {
  candidates: ['Elena', 'Marco', 'Lucia', 'André', 'Sofia'],
  seats: 3,
  election_type: 'stv-md',
  ballots: [
    { votes: 11, ranks: [0, 3, 4, 1, 2] },
    { votes: 4, ranks: [0, 3, 4, 2, 1] },
    { votes: 9, ranks: [2, 0, 1, 3, 4] },
    { votes: 8, ranks: [2, 3, 0, 1, 4] },
    { votes: 4, ranks: [4, 3, 2, 1, 0] },
    { votes: 3, ranks: [3, 4, 2, 0, 1] },
  ],
  groups: [],
  candidate_groups: [],
};

// Worked example per election system, used on the /systems page.
export const EXAMPLE_ELECTIONS: Record<ElectionType, Election> = {
  'stv-md': DEFAULT_ELECTION,
  'stv-md-coperland': DEFAULT_ELECTION,
  'stv-md-grouped': {
    candidates: ['Ana', 'Bruno', 'Carla', 'Diogo', 'Eva', 'Filipe'],
    seats: 3,
    election_type: 'stv-md-grouped',
    ballots: [
      { votes: 5, ranks: [0, 1, 2, 3, 4, 5] },
      { votes: 3, ranks: [3, 4, 5, 0, 1, 2] },
      { votes: 2, ranks: [1, 0, 2, 4, 3, 5] },
    ],
    groups: [
      { name: 'Group A', seats: 2 },
      { name: 'Group B', seats: 1 },
    ],
    candidate_groups: ['Group A', 'Group A', 'Group A', 'Group B', 'Group B', 'Group B'],
  },
  // Pairwise cycle A>B, B>C, C>A; the strongest path A>B>C (5) beats C>A (4),
  // so the Schulze winner is Ana. Seed fixed for reproducibility.
  schulze: {
    candidates: ['Ana', 'Bruno', 'Carla'],
    seats: 1,
    election_type: 'schulze',
    tie_break_seed: 42,
    ballots: [
      { votes: 3, ranks: [0, 1, 2] },
      { votes: 2, ranks: [2, 0, 1] },
      { votes: 2, ranks: [1, 2, 0] },
    ],
  },
};
