import Markdown from 'preact-markdown';

import Typography from '@mui/material/Typography';

const TEXT = `
This website runs the Single Transferable Vote (STV) using Meek's method using Droop quota, a precise and widely recognized algorithm for proportional ranked-choice elections.
This is the same type of method used in various real-world governmental and organizational elections.

The underlying algorithm is implemented in open source by Guillaume Endignoux, an engineer at Google.
It can be found [here](https://github.com/gendx/stv-rs) and explained [here](https://gendignoux.com/blog/2023/03/27/single-transferable-vote.html).

By default, STV selects a set of winners, but does not provide a strict ranking of those elected.
To provide a podium-style order, this website augments the STV results by ranking the elected candidates using [Copeland's method](https://en.wikipedia.org/wiki/Copeland%27s_method),
a well-known approach based on pairwise comparison of preferences across all ballots.
Specifically, candidates are first selected by STV, and then their order is determined according to voter preferences using Copeland's method.
`

export default function Home() {
    return <Typography component="div">
        <Markdown markdown={TEXT} />
    </Typography>
}
