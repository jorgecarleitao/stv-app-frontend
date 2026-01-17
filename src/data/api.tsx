const BASE_URL = '/api';

// ===== Shared Data Structures =====

export interface Ballot {
  votes: number;
  ranks: (number | null)[] | null;
}

export interface Election {
  candidates: string[];
  seats: number;
  ballots: Ballot[];
}

export interface Elected {
  candidate: string;
  id: number;
}

export interface ElectionResult {
  election: Election;
  log: string;
  elected: Elected[];
  order: Record<number, number>; // Map from candidate ID to order position
  pairwise_matrix: number[][]; // n×n matrix of pairwise comparisons
}

// ===== Elections API =====

export interface ElectionConfig {
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

export interface ElectionState {
  election: ElectionConfig;
  potential_voters: number;
  casted: number;
  results?: ElectionResult;
}

export interface CreateElectionRequest {
  title: string;
  description?: string | null;
  candidates: string[];
  num_seats: number;
  start_time: string;
  end_time: string;
}

export interface ElectionResponse {
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

/**
 * Fetch list of all available elections
 */
export async function listElections(): Promise<ElectionConfig[]> {
  const response = await fetch(`${BASE_URL}/elections`, {
    method: 'GET',
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to list elections: ${await response.text()}`);
  }

  return response.json();
}

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
 * Create ballot tokens for an election (admin only)
 */
export async function createBallotTokens(
  electionId: string,
  adminUuid: string,
  count: number
): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/elections/${electionId}/admin/${adminUuid}/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(count),
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to create ballot tokens: ${await response.text()}`);
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
