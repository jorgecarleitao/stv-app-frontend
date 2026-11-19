import type { ElectionSystemUI } from './types';
import { LogDetails, LogSummary, noExtras, rankedBallotPayload, rankedBallotRanks } from './ranked';
import { BallotsEditor } from '../ballot';
import type { CommonFields, ElectionExtras } from './types';
import type { CreateElectionRequest } from '../data/types';

// Schulze: single-winner Condorcet method (beatpath). Ranked ballots, exactly
// one seat, ties on beatpath strength broken by the election's seeded lot.
// The winner is shown like the STV elected list (which has exactly one entry).
const Schulze: ElectionSystemUI = {
  id: 'schulze',
  label: 'Schulze (single winner)',
  fixedSeats: 1,
  hasExtras: false,
  defaultExtras: noExtras,
  validateExtras: (t, _extras, _candidates, numSeats) =>
    numSeats === 1
      ? null
      : {
          field: 'seats',
          message: t('Schulze elects a single winner: number of seats must be 1'),
        },
  buildRequest: (common: CommonFields, _extras: ElectionExtras): CreateElectionRequest =>
    ({
      ...common,
      num_seats: 1,
      election_type: 'schulze',
      // tie_break_seed omitted: the server generates and persists one
    }) as CreateElectionRequest,
  ConfigSection: null,
  candidatesExtras: () => ({}),
  BallotEditor: BallotsEditor,
  ballotPayload: rankedBallotPayload,
  readBallotRanks: rankedBallotRanks,
  resultsMode: 'unordered',
  ResultSections: ({ result, seats }) => (
    <>
      <LogSummary result={result} seats={seats} />
      <LogDetails result={result} />
    </>
  ),
};

export default Schulze;
