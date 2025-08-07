export const API_URL = '/api/election';

export interface Ballot {
    votes: number;
    order: number[][];
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

export async function fetchResult(election: Election): Promise<ElectionResult> {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(election),
        mode: 'cors',
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}
