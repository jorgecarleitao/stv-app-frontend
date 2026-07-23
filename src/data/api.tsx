const BASE_URL = '/api';

// ===== Shared Data Structures =====

export type ElectionType = 'stv-md' | 'stv-md-coperland' | 'stv-md-grouped';

export interface GroupConfig {
  name: string;
  seats: number;
}

export interface Ballot {
  votes: number;
  ranks: (number | null)[] | null;
}

export interface Election {
  candidates: string[];
  seats: number;
  election_type: ElectionType;
  ballots: Ballot[];
  groups?: GroupConfig[];
  candidate_groups?: string[];
}

export interface Elected {
  candidate: string;
  id: number;
}

// ===== Structured Counting Log =====

export interface CountingLogHeader {
  title: string;
  package_name: string;
  rule: string;
  arithmetic: string;
  seats: number;
  ballots: number;
  quota: string;
  omega: string;
}

export interface CountingLogCandidate {
  name: string;
  withdrawn: boolean;
}

export type CountingLogCandidateStatus = 'elected' | 'hopeful' | 'defeated';

export interface CountingLogCandidateCount {
  name: string;
  status: CountingLogCandidateStatus;
  votes: string;
}

export interface CountingLogStats {
  quota: string;
  votes: string;
  residual: string;
  total: string;
  surplus: string;
}

export type CountingLogActionType =
  | 'begin_count'
  | 'count_complete'
  | { elect: { candidate: string } }
  | { elect_remaining: { candidate: string } }
  | { iterate: { reason: string } }
  | { defeat: { reason: string; candidate: string } }
  | { defeat_remaining: { candidate: string } }
  | { break_tie: { candidates: string[]; defeated: string } };

export interface CountingLogAction {
  action_type: CountingLogActionType;
  candidate_counts: CountingLogCandidateCount[];
  stats: CountingLogStats;
}

export interface CountingLogRound {
  round_number: number;
  actions: CountingLogAction[];
}

export interface CountingLog {
  header: CountingLogHeader;
  candidates: CountingLogCandidate[];
  rounds: CountingLogRound[];
}

// ===== Election Result (tagged union) =====

export interface GroupResult {
  group: string;
  seats: number;
  election: Election;
  log: CountingLog;
  elected: Elected[];
}

export type ElectionResult =
  | {
      type: 'stv-md';
      election: Election;
      log: CountingLog;
      elected: Elected[];
    }
  | {
      type: 'stv-md-coperland';
      election: Election;
      log: CountingLog;
      elected: Elected[];
      order: Record<string, number>;
      pairwise_matrix: number[][];
    }
  | {
      type: 'stv-md-grouped';
      election: Election;
      groups: GroupConfig[];
      group_results: GroupResult[];
      elected: Elected[];
    };

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

export function isCopelandResult(r: ElectionResult): r is Extract<ElectionResult, { type: 'stv-md-coperland' }> {
  return r.type === 'stv-md-coperland';
}

export function isGroupedResult(r: ElectionResult): r is Extract<ElectionResult, { type: 'stv-md-grouped' }> {
  return r.type === 'stv-md-grouped';
}

// ===== Elections API =====

export type ElectionConfig =
  | {
      election_type: 'stv-md';
      id: string;
      title: string;
      description?: string;
      candidates: string[];
      seats: number;
      start_time: string;
      end_time: string;
      number_of_ballots: number;
      ballots?: string[];
    }
  | {
      election_type: 'stv-md-coperland';
      id: string;
      title: string;
      description?: string;
      candidates: string[];
      seats: number;
      start_time: string;
      end_time: string;
      number_of_ballots: number;
      ballots?: string[];
    }
  | {
      election_type: 'stv-md-grouped';
      id: string;
      title: string;
      description?: string;
      candidates: string[];
      seats: number;
      start_time: string;
      end_time: string;
      number_of_ballots: number;
      ballots?: string[];
      groups: GroupConfig[];
      candidate_groups: string[];
    };

export interface ElectionState {
  election: ElectionConfig;
  potential_voters: number;
  casted: number;
  results?: ElectionResult;
}

export type CreateElectionRequest =
  | {
      election_type: 'stv-md';
      title: string;
      description?: string | null;
      candidates: string[];
      num_seats: number;
      start_time: string;
      end_time: string;
    }
  | {
      election_type: 'stv-md-coperland';
      title: string;
      description?: string | null;
      candidates: string[];
      num_seats: number;
      start_time: string;
      end_time: string;
    }
  | {
      election_type: 'stv-md-grouped';
      title: string;
      description?: string | null;
      candidates: string[];
      num_seats: number;
      start_time: string;
      end_time: string;
      groups: GroupConfig[];
      candidate_groups: string[];
    };

export type ElectionResponse =
  | {
      election_type: 'stv-md';
      uuid: string;
      admin_uuid: string;
      title: string;
      description?: string | null;
      candidates: string[];
      num_seats: number;
      start_time: string;
      end_time: string;
      is_locked: boolean;
    }
  | {
      election_type: 'stv-md-coperland';
      uuid: string;
      admin_uuid: string;
      title: string;
      description?: string | null;
      candidates: string[];
      num_seats: number;
      start_time: string;
      end_time: string;
      is_locked: boolean;
    }
  | {
      election_type: 'stv-md-grouped';
      uuid: string;
      admin_uuid: string;
      title: string;
      description?: string | null;
      candidates: string[];
      num_seats: number;
      start_time: string;
      end_time: string;
      is_locked: boolean;
      groups: GroupConfig[];
      candidate_groups: string[];
    };

/**
 * Create a new election
 */
export async function createElection(request: CreateElectionRequest): Promise<ElectionResponse> {
  const response = await fetch(`${BASE_URL}/elections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to create election: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Fetch details and results for a specific election
 */
export async function getElection(electionId: string): Promise<ElectionState> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}`, {
    method: 'GET',
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch election: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Fetch election details for admin (requires admin UUID)
 */
export async function getElectionByAdmin(
  electionId: string,
  adminUuid: string
): Promise<ElectionResponse> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}/admin/${adminUuid}`, {
    method: 'GET',
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch election: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Update an election (requires admin UUID)
 */
export async function updateElectionByAdmin(
  electionId: string,
  adminUuid: string,
  request: CreateElectionRequest
): Promise<ElectionResponse> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}/admin/${adminUuid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to update election: ${await response.text()}`);
  }

  return response.json();
}

// ===== Ballot Tokens API =====

export interface BallotToken {
  election_id: string;
  id: string;
  created_at: string;
  converted_at: string | null;
  email: string | null;
  sent_at: string | null;
}

export interface CreateTokenResult {
  id: string;
  email: string | null;
}

export interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  from_name: string;
  from_email: string;
}

export interface UpsertEmailConfigRequest {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password?: string;
  from_name: string;
  from_email: string;
}

export interface SendEmailResult {
  token_id: string;
  error: string | null;
}

/**
 * Fetch all ballot tokens for an election (admin only)
 */
export async function getBallotTokens(
  electionId: string,
  adminUuid: string
): Promise<BallotToken[]> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}/admin/${adminUuid}/tokens`, {
    method: 'GET',
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ballot tokens: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Create ballot tokens for an election (admin only).
 * Provide either `count` (no emails) or `recipients` (emails, count inferred).
 */
export async function createBallotTokens(
  electionId: string,
  adminUuid: string,
  countOrRecipients: number | string[]
): Promise<CreateTokenResult[]> {
  let body: object;
  if (Array.isArray(countOrRecipients)) {
    body = { recipients: countOrRecipients };
  } else {
    body = { count: countOrRecipients };
  }
  const response = await fetch(`${BASE_URL}/elections/${electionId}/admin/${adminUuid}/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to create ballot tokens: ${await response.text()}`);
  }

  return response.json();
}

/**
 * PATCH a token to set its sent_at timestamp (self-delivered mode)
 */
export async function patchToken(
  electionId: string,
  adminUuid: string,
  tokenId: string,
  sentAt: string
): Promise<{ token_id: string; sent_at: string }> {
  const response = await fetch(
    `${BASE_URL}/elections/${electionId}/admin/${adminUuid}/tokens/${tokenId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sent_at: sentAt }),
      mode: 'cors',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update token: ${await response.text()}`);
  }

  return response.json();
}

/**
 * POST to batch mark tokens as sent (self-delivered mode).
 */
export async function batchMarkSent(
  electionId: string,
  adminUuid: string,
  sentAt: string,
  tokenIds: string[]
): Promise<{ token_id: string; sent_at: string }[]> {
  const response = await fetch(
    `${BASE_URL}/elections/${electionId}/admin/${adminUuid}/tokens/mark-sent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sent_at: sentAt, token_ids: tokenIds }),
      mode: 'cors',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to mark tokens as sent: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Get email SMTP configuration for an election (admin only)
 */
export async function getEmailConfig(
  electionId: string,
  adminUuid: string
): Promise<EmailConfig | null> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}/admin/${adminUuid}/email-config`, {
    method: 'GET',
    mode: 'cors',
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to fetch email config: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Create or update email SMTP configuration for an election (admin only)
 */
export async function upsertEmailConfig(
  electionId: string,
  adminUuid: string,
  config: UpsertEmailConfigRequest
): Promise<EmailConfig> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}/admin/${adminUuid}/email-config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to update email config: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Delete email SMTP configuration for an election (admin only)
 */
export async function deleteEmailConfig(
  electionId: string,
  adminUuid: string
): Promise<void> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}/admin/${adminUuid}/email-config`, {
    method: 'DELETE',
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete email config: ${await response.text()}`);
  }
}

/**
 * Send emails for pending ballot tokens (admin only).
 * If tokenIds is empty, sends to all unsent tokens with an email.
 */
export async function sendEmails(
  electionId: string,
  adminUuid: string,
  tokenIds?: string[]
): Promise<SendEmailResult[]> {
  const baseUrl = window.location.origin;
  const body: { base_url: string; token_ids?: string[] } = { base_url: baseUrl };
  if (tokenIds && tokenIds.length > 0) {
    body.token_ids = tokenIds;
  }
  const response = await fetch(`${BASE_URL}/elections/${electionId}/admin/${adminUuid}/tokens/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to send emails: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Send email for a single token (admin only)
 */
export async function sendSingleTokenEmail(
  electionId: string,
  adminUuid: string,
  tokenId: string
): Promise<SendEmailResult> {
  const body = { base_url: window.location.origin };
  const response = await fetch(
    `${BASE_URL}/elections/${electionId}/admin/${adminUuid}/tokens/${tokenId}/send`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      mode: 'cors',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to send email: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Redeem a token to get a ballot UUID
 */
export async function redeemToken(electionId: string, tokenId: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}/tokens/${tokenId}/redeem`, {
    method: 'POST',
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to redeem token: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Get token info (check if already redeemed)
 */
export async function getTokenInfo(electionId: string, tokenId: string): Promise<BallotToken> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}/tokens/${tokenId}`, {
    method: 'GET',
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to get token info: ${await response.text()}`);
  }

  return response.json();
}

// ===== Ballot API =====

/**
 * Fetch a specific ballot by UUID
 */
export async function getBallot(electionId: string, ballotUuid: string): Promise<Ballot | null> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}/ballot/${ballotUuid}`, {
    method: 'GET',
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ballot: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Submit or update a ballot for an election
 */
export async function putBallot(
  electionId: string,
  ballotUuid: string,
  ballot: Ballot
): Promise<void> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}/ballot/${ballotUuid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ballot),
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to submit ballot: ${await response.text()}`);
  }
}

// ===== Export API =====

export function getExportUrl(electionId: string, includeEmails?: boolean): string {
  const url = `${BASE_URL}/elections/${electionId}/export`;
  return includeEmails ? `${url}?include_emails=true` : url;
}

// ===== Simulator API =====

/**
 * Simulate an election with custom candidates, seats, and ballots
 */
export async function simulateElection(election: Election): Promise<ElectionResult> {
  const response = await fetch(`${BASE_URL}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(election),
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to simulate election: ${await response.text()}`);
  }

  return response.json();
}
