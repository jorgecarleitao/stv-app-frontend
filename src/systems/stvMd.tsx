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

const StvMd: ElectionSystemUI = {
  id: 'stv-md',
  label: 'STV-MD (unordered)',
  hasExtras: false,
  defaultExtras: noExtras,
  validateExtras: noExtrasValidation,
  buildRequest: common => plainBuildRequest('stv-md', common),
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

export default StvMd;
