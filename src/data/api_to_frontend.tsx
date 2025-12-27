import { Ballot as ApiBallot, Election as ApiElection } from './api';
import { Ballot as FrontendBallot, Election as FrontendElection } from './frontend';

/**
 * Convert API ballot (0-based ranks) to frontend ballot (1-based ranks)
 */
export function convertFromApiBallot(apiBallot: ApiBallot): FrontendBallot {
    return {
        votes: apiBallot.votes,
        // Convert 0-based ranks (API) to 1-based ranks (UI)
        ranks: apiBallot.ranks.map(r => r === null ? null : r + 1)
    };
}

/**
 * Convert API election (0-based ranks) to frontend election (1-based ranks)
 */
export function convertFromApiElection(apiElection: ApiElection): FrontendElection {
    return {
        candidates: apiElection.candidates,
        seats: apiElection.seats,
        ballots: apiElection.ballots.map(convertFromApiBallot)
    };
}
