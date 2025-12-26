const BASE_URL = '/api';

// ===== Shared Data Structures =====

export interface Ballot {
    votes: number;
    ranks: (number | null)[];
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
    log: string;
    elected: Elected[];
}

// ===== Elections API =====

export interface ElectionConfig {
    id: string;
    name: string;
    candidates: string[];
    seats: number;
}

export interface ElectionState {
    election: ElectionConfig;
    potential_voters: number;
    casted: number;
    results?: ElectionResult;
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
