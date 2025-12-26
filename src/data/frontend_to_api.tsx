import { Election } from '../data/api'

export function convertToApiElection(frontend: { candidates: string[]; seats: number; ballots: { votes: number; ranks: (number | null)[]; }[] }): Election {

    return {
        candidates: frontend.candidates,
        seats: frontend.seats,
        ballots: frontend.ballots.map(b => ({
            votes: b.votes,
            // Convert 1-based ranks (UI) to 0-based ranks (API)
            ranks: b.ranks.map(r => r === null ? null : r - 1)
        }))
    };
}
