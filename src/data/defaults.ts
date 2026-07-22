import { Election } from './api';

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
