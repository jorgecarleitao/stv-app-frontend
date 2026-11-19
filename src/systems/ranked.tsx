import type { ElectionResult, ElectionType, CastBallotRequest } from '../data/types';
import { isGroupedResult } from '../data/types';
import { ResultsSummary } from '../components/ResultsSummary';
import { CountingLog } from '../components/CountingLog';
import type { CommonFields, ElectionExtras } from './types';
import type { CreateElectionRequest } from '../data/types';

// ===== Shared helpers for ranked-ballot systems (stv-md, stv-md-coperland, stv-md-grouped) =====

export function rankedBallotPayload(
  electionType: ElectionType,
  ranks: (number | null)[]
): CastBallotRequest {
  switch (electionType) {
    case 'stv-md':
    case 'stv-md-coperland':
    case 'stv-md-grouped':
    case 'schulze':
      return { election_type: electionType, ranks };
    default:
      throw new Error(`Unsupported election type: ${electionType}`);
  }
}

export function rankedBallotRanks(data: CastBallotRequest): (number | null)[] {
  return data.ranks;
}

export function noExtras(_candidates: string[]): ElectionExtras {
  return { groups: [], candidateGroups: [] };
}

export function noExtrasValidation(): null {
  return null;
}

export function plainBuildRequest(id: ElectionType, common: CommonFields): CreateElectionRequest {
  return { ...common, election_type: id } as CreateElectionRequest;
}

// ===== Shared result sections =====

/** Summary cards (per group for grouped results) */
export function LogSummary({ result, seats }: { result: ElectionResult; seats: number }) {
  if (isGroupedResult(result)) {
    return (
      <>
        {result.group_results.map(gr => (
          <ResultsSummary
            key={gr.group}
            log={gr.log}
            seats={gr.seats}
            numElected={gr.elected.length}
            groupName={gr.group}
          />
        ))}
      </>
    );
  }
  return <ResultsSummary log={result.log} seats={seats} numElected={result.elected.length} />;
}

/** Detailed counting log (per group for grouped results) */
export function LogDetails({ result }: { result: ElectionResult }) {
  if (isGroupedResult(result)) {
    return (
      <>
        {result.group_results.map(gr => (
          <CountingLog key={gr.group} log={gr.log} groupName={gr.group} />
        ))}
      </>
    );
  }
  return <CountingLog log={result.log} />;
}
