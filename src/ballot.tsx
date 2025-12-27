import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import DeleteIcon from '@mui/icons-material/Delete';

import { Ballot } from './data/frontend'
import { CandidateRankSelector } from './components/CandidateRankSelector';

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
    const { t } = useTranslation();
    const maxCandidates = candidates.length;

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
                    <Stack spacing={1.5}>
                        {candidates.map((cand, candIdx) => (
                            <CandidateRankSelector
                                key={candIdx}
                                candidate={cand}
                                rank={b.ranks[candIdx]}
                                maxRank={maxCandidates}
                                onChange={(rank) => onChangeBallotRank(ballotIdx, candIdx, rank)}
                            />
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
