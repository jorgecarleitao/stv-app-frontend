import { Ballot as ApiBallot } from './api';
import { Ballot as FrontendBallot } from './frontend';

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
