import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';

import DeleteIcon from '@mui/icons-material/Delete';

import { Ballot } from '../data/frontend';
import { CandidateRankSelector } from './CandidateRankSelector';

interface BallotGroupDisplayProps {
    candidates: string[];
    ballot: Ballot;
    groupNumber?: number;
    readOnly?: boolean;
    onChangeVotes?: (votes: number) => void;
    onChangeRank?: (candIdx: number, rank: number | null) => void;
    onRemove?: () => void;
    subtitle?: string;
}

export function BallotGroupDisplay({
    candidates,
    ballot,
    groupNumber,
    readOnly = false,
    onChangeVotes,
    onChangeRank,
    onRemove,
    subtitle
}: BallotGroupDisplayProps) {
    const { t } = useTranslation();
    const maxCandidates = candidates.length;

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                {groupNumber !== undefined && (
                    <Typography fontWeight="bold">
                        {t('Ballot group')} {groupNumber}
                    </Typography>
                )}
                {readOnly ? (
                    <Chip
                        label={`${ballot.votes} ${ballot.votes === 1 ? t('vote') : t('votes')}`}
                        color="primary"
                        size="medium"
                    />
                ) : (
                    <TextField
                        label={t('Votes')}
                        size="small"
                        type="number"
                        sx={{ width: 90 }}
                        inputProps={{ min: 1 }}
                        value={ballot.votes}
                        onChange={e => onChangeVotes?.(Number(e.target.value))}
                    />
                )}
                {!readOnly && onRemove && (
                    <IconButton color="error" onClick={onRemove}>
                        <DeleteIcon />
                    </IconButton>
                )}
                {subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            <Box sx={{ mt: 2, pl: 2 }}>
                <Stack spacing={1.5}>
                    {candidates.map((cand, candIdx) => (
                        <CandidateRankSelector
                            key={candIdx}
                            candidate={cand}
                            rank={ballot.ranks[candIdx]}
                            maxRank={maxCandidates}
                            readOnly={readOnly}
                            onChange={(rank) => onChangeRank?.(candIdx, rank)}
                        />
                    ))}
                </Stack>
            </Box>
        </Paper>
    );
}
