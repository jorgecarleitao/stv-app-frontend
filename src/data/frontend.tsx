export type Candidate = string;

export interface Ballot {
    votes: number;
    ranks: (number | null)[];
};

export interface Election {
    candidates: string[]
    seats: number;
    ballots: Ballot[]
}