import type { components } from './api.types';

type Schemas = components['schemas'];

// ===== Types generated from the OpenAPI spec (src/data/api.types.ts, via `pnpm gen:api`) =====

export type ElectionType = Schemas['ElectionType'];
export type GroupConfig = Schemas['GroupConfig'];
export type Elected = Schemas['Elected'];
export type GroupResult = Schemas['GroupResult'];
export type ElectionResult = Schemas['ElectionResult'];
export type ElectionConfig = Schemas['ElectionConfig'];
export type ElectionState = Schemas['ElectionState'];
export type CreateElectionRequest = Schemas['CreateElectionRequest'];
export type ElectionResponse = Schemas['ElectionResponse'];
export type CountingLog = Schemas['CountingLog'];
export type CountingLogHeader = Schemas['CountingLogHeader'];
export type CountingLogCandidate = Schemas['CountingLogCandidate'];
export type CountingLogCandidateCount = Schemas['CountingLogCandidateCount'];
export type CountingLogCandidateStatus = Schemas['CountingLogCandidateStatus'];
export type CountingLogStats = Schemas['CountingLogStats'];
export type CountingLogAction = Schemas['CountingLogAction'];
export type CountingLogActionType = Schemas['CountingLogActionType'];
export type CountingLogRound = Schemas['CountingLogRound'];
export type SendEmailsRequest = Schemas['SendEmailsRequest'];
export type SendEmailResult = Schemas['SendEmailResult'];
export type MarkSentBody = Schemas['MarkSentBody'];
export type MarkSentResult = Schemas['MarkSentResult'];
export type BatchMarkSentBody = Schemas['BatchMarkSentBody'];
export type CreateTokenResult = Schemas['CreateTokenResult'];
export type CreateTokensBody = Schemas['CreateTokensBody'];
export type EmailConfigResponse = Schemas['EmailConfigResponse'];
export type UpsertEmailConfigRequest = Schemas['UpsertEmailConfigRequest'];
export type TestEmailRequest = Schemas['TestEmailRequest'];

// ===== Local types (not part of the API spec) =====

// Ballot group in the simulator (a CombinedBallot); with nullable ranks, also the stored ballot row
export interface Ballot {
  votes: number;
  ranks: (number | null)[] | null;
}

// Flattened election model used by the simulator; wire-compatible with the tagged Election union
export interface Election {
  candidates: string[];
  seats: number;
  election_type: ElectionType;
  ballots: Ballot[];
  groups?: GroupConfig[];
  candidate_groups?: string[];
}

export interface BallotToken {
  election_id: string;
  id: string;
  created_at: string;
  converted_at: string | null;
  email: string | null;
  sent_at: string | null;
}

export interface EmailConfig {
  smtp_host: string;
  smtp_username: string;
  from_name: string;
  from_email: string;
}

// ===== Helpers for discriminated unions =====

export function isGroupedElectionConfig(
  c: ElectionConfig
): c is Extract<ElectionConfig, { election_type: 'stv-md-grouped' }> {
  return c.election_type === 'stv-md-grouped';
}

export function isGroupedElectionResponse(
  r: ElectionResponse
): r is Extract<ElectionResponse, { election_type: 'stv-md-grouped' }> {
  return r.election_type === 'stv-md-grouped';
}

export function isGroupedElectionRequest(
  r: CreateElectionRequest
): r is Extract<CreateElectionRequest, { election_type: 'stv-md-grouped' }> {
  return r.election_type === 'stv-md-grouped';
}

export function isCopelandResult(
  r: ElectionResult
): r is Extract<ElectionResult, { type: 'stv-md-coperland' }> {
  return r.type === 'stv-md-coperland';
}

export function isGroupedResult(
  r: ElectionResult
): r is Extract<ElectionResult, { type: 'stv-md-grouped' }> {
  return r.type === 'stv-md-grouped';
}
