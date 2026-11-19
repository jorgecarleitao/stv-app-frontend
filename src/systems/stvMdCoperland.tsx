import type { ElectionSystemUI } from './types';
import {
  LogDetails,
  LogSummary,
  noExtras,
  noExtrasValidation,
  plainBuildRequest,
  rankedBallotPayload,
  rankedBallotRanks,
} from './ranked';
import { BallotsEditor } from '../ballot';
import { PairwiseMatrix } from '../components/PairwiseMatrix';
import { isCopelandResult } from '../data/types';

const StvMdCoperland: ElectionSystemUI = {
  id: 'stv-md-coperland',
  label: 'STV-MD Copeland (ordered)',
  hasExtras: false,
  defaultExtras: noExtras,
  validateExtras: noExtrasValidation,
  buildRequest: common => plainBuildRequest('stv-md-coperland', common),
  ConfigSection: null,
  candidatesExtras: () => ({}),
  BallotEditor: BallotsEditor,
  ballotPayload: rankedBallotPayload,
  readBallotRanks: rankedBallotRanks,
  resultsMode: 'ordered',
  ResultSections: ({ result, candidates, seats }) => (
    <>
      <LogSummary result={result} seats={seats} />
      {isCopelandResult(result) && (
        <PairwiseMatrix
          candidates={candidates}
          pairwiseMatrix={result.pairwise_matrix}
          order={result.order}
        />
      )}
      <LogDetails result={result} />
    </>
  ),
};

export default StvMdCoperland;
