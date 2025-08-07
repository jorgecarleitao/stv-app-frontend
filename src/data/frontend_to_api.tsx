import { Election } from '../data/api'

function ranksToOrder(ranks: (number | null)[]): number[][] {
    const numRanks = ranks.length;
    const order: number[][] = [];
    for (let rank = 1; rank <= numRanks; rank++) {
        const group: number[] = [];
        ranks.forEach((r, ci) => {
            if (r === rank) group.push(ci);
        });
        order.push(group);
    }
    return order;
}

export function convertToApiElection(frontend: { candidates: string[]; seats: number; ballots: { votes: number; ranks: (number | null)[]; }[] }): Election {

    return {
        candidates: frontend.candidates,
        seats: frontend.seats,
        ballots: frontend.ballots.map(b => ({
            votes: b.votes,
            order: ranksToOrder(b.ranks)
        }))
    };
}
