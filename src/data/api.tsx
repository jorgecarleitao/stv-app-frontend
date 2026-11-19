import type {
  Ballot,
  BallotToken,
  CastBallotRequest,
  CreateElectionRequest,
  CreateTokenResult,
  Election,
  ElectionResponse,
  ElectionResult,
  ElectionState,
  EmailConfig,
  SendEmailResult,
  StoredBallot,
  UpsertEmailConfigRequest,
} from './types';

const BASE_URL = '/api';

// ===== Elections API =====

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
  const response = await fetch(
    `${BASE_URL}/elections/${electionId}/admin/${adminUuid}/email-config`,
    {
      method: 'GET',
      mode: 'cors',
    }
  );

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
  const response = await fetch(
    `${BASE_URL}/elections/${electionId}/admin/${adminUuid}/email-config`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
      mode: 'cors',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update email config: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Send a test email using the saved SMTP configuration (admin only)
 */
export async function sendTestEmail(
  electionId: string,
  adminUuid: string,
  toEmail: string
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/elections/${electionId}/admin/${adminUuid}/email-config/test`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_email: toEmail }),
      mode: 'cors',
    }
  );

  if (!response.ok) {
    throw new Error(`Test email failed: ${await response.text()}`);
  }
}

/**
 * Delete email SMTP configuration for an election (admin only)
 */
export async function deleteEmailConfig(electionId: string, adminUuid: string): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/elections/${electionId}/admin/${adminUuid}/email-config`,
    {
      method: 'DELETE',
      mode: 'cors',
    }
  );

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
  const response = await fetch(
    `${BASE_URL}/elections/${electionId}/admin/${adminUuid}/tokens/send`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      mode: 'cors',
    }
  );

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
export async function getBallot(electionId: string, ballotUuid: string): Promise<StoredBallot | null> {
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
  ballot: CastBallotRequest
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
