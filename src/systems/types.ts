import type { ComponentType } from 'react';
import type {
  Ballot,
  CastBallotRequest,
  CreateElectionRequest,
  ElectionResult,
  ElectionType,
  GroupConfig,
} from '../data/types';

/** Fields every election has, regardless of the voting system */
export interface CommonFields {
  title: string;
  description: string | null;
  candidates: string[];
  num_seats: number;
  start_time: string;
  end_time: string;
}

/** Per-system extra form state (e.g. groups for stv-md-grouped) */
export interface ElectionExtras {
  groups: GroupConfig[];
  candidateGroups: string[];
}

export interface ExtrasError {
  field: 'seats' | 'candidates' | 'general';
  message: string;
}

/** Extra props for the CandidatesList component */
export interface CandidatesExtras {
  groups?: GroupConfig[];
  candidateGroups?: string[];
  onCandidateGroupChange?: (index: number, group: string) => void;
}

export interface BallotEditorProps {
  candidates: string[];
  ballots: Ballot[];
  onChangeBallotVotes: (ballotIdx: number, votes: number) => void;
  onChangeBallotRank: (ballotIdx: number, candIdx: number, rank: number | null) => void;
  onAddBallot: () => void;
  onRemoveBallot: (ballotIdx: number) => void;
}

export type ResultsMode = 'unordered' | 'ordered' | 'grouped';

type T = (key: string) => string;

/**
 * UI surface of one election system. Adding a new election system means
 * adding one module here plus one entry in the `systems` registry — the
 * pages and components look everything up through `getSystem()`.
 */
export interface ElectionSystemUI {
  id: ElectionType;
  /** i18n key shown in the election-type picker */
  label: string;
  /** whether this system has extra config beyond the common fields */
  hasExtras: boolean;
  /** extra fields to initialize when the user switches to this type */
  defaultExtras: (candidates: string[]) => ElectionExtras;
  /** validate the extra fields before saving; null = ok */
  validateExtras: (
    t: T,
    extras: ElectionExtras,
    candidates: string[],
    numSeats: number
  ) => ExtrasError | null;
  /** build the CreateElectionRequest wire payload for this system */
  buildRequest: (common: CommonFields, extras: ElectionExtras) => CreateElectionRequest;
  /** extra config section rendered in the admin/simulate forms */
  ConfigSection: ComponentType<{
    extras: ElectionExtras;
    onExtrasChange: (e: ElectionExtras) => void;
    disabled?: boolean;
  }> | null;
  /** extra CandidatesList props (e.g. the group-assignment column) */
  candidatesExtras: (
    extras: ElectionExtras,
    onCandidateGroupChange?: (index: number, group: string) => void
  ) => CandidatesExtras;
  /** editor for the ballots of a simulation */
  BallotEditor: ComponentType<BallotEditorProps>;
  /** build the PUT ballot payload for the voter page */
  ballotPayload: (electionType: ElectionType, ranks: (number | null)[]) => CastBallotRequest;
  /** read ranks back out of a stored ballot payload */
  readBallotRanks: (data: CastBallotRequest) => (number | null)[];
  /** how the elected list is displayed */
  resultsMode: ResultsMode;
  /** sections rendered below the elected list (summary, logs, matrices) */
  ResultSections: ComponentType<{ result: ElectionResult; candidates: string[]; seats: number }>;
}
