import { useTranslation } from 'react-i18next';

import {
    Box,
    Button,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { Ballot } from './data/frontend'

export function BallotsEditor({
    candidates,
    ballots,
    onChangeBallotVotes,
    onChangeBallotRank,
    onAddBallot,
    onRemoveBallot
}: {
    candidates: string[];
    ballots: Ballot[];
    onChangeBallotVotes: (ballotIdx: number, votes: number) => void;
    onChangeBallotRank: (ballotIdx: number, candIdx: number, rank: number | null) => void;
    onAddBallot: () => void;
    onRemoveBallot: (ballotIdx: number) => void;
}) {
    const { t, i18n } = useTranslation();
    const maxCandidates = candidates.length;
    const rankOptions = [null, ...Array.from({ length: maxCandidates }, (_, i) => i + 1)];

    return <Stack spacing={2}>
        {ballots.map((b, ballotIdx) => (
            <Paper variant="outlined" sx={{ p: 2 }} key={ballotIdx}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography fontWeight="bold">{t('Ballot group')} {ballotIdx + 1}</Typography>
                    <TextField
                        label="Votes"
                        size="small"
                        type="number"
                        sx={{ width: 90 }}
                        inputProps={{ min: 1 }}
                        value={b.votes}
                        onChange={e => onChangeBallotVotes(ballotIdx, Number(e.target.value))}
                    />
                    <IconButton color="error" onClick={() => onRemoveBallot(ballotIdx)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
                <Box sx={{ mt: 2, pl: 2 }}>
                    <Stack direction="row" gap={2} flexWrap="wrap">
                        {candidates.map((cand, candIdx) => (
                            <TextField
                                key={candIdx}
                                select
                                label={cand}
                                size="small"
                                sx={{ width: 120 }}
                                value={
                                    b.ranks[candIdx] === null || b.ranks[candIdx] === undefined
                                        ? ''
                                        : b.ranks[candIdx]
                                }
                                onChange={e => {
                                    const val =
                                        e.target.value === '' ? null : Number(e.target.value);
                                    onChangeBallotRank(ballotIdx, candIdx, val);
                                }}
                            >
                                {rankOptions.map(rank => (
                                    <MenuItem value={rank} key={rank}>
                                        {rank || ""}
                                    </MenuItem>
                                ))}
                            </TextField>
                        ))}
                    </Stack>
                </Box>
            </Paper>
        ))}
        <Button variant="contained" onClick={onAddBallot}>
            {t('Add Ballot group')}
        </Button>
    </Stack>
}
