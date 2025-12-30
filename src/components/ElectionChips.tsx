import { useTranslation } from 'react-i18next';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PeopleIcon from '@mui/icons-material/People';
import WeekendIcon from '@mui/icons-material/Weekend';

interface ElectionChipsProps {
    seats: number;
    candidatesCount: number;
    votersCount: number;
    castedCount?: number;
    startTime: string | Date;
    endTime: string | Date;
    size?: 'small' | 'medium';
}

export function ElectionChips({
    seats,
    candidatesCount,
    votersCount,
    castedCount,
    startTime,
    endTime,
    size = 'medium'
}: ElectionChipsProps) {
    const { t } = useTranslation();

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    const isOpen = now >= start && now < end;

    return (
        <Stack direction="row" spacing={1} sx={{ mt: size === 'small' ? 1 : 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip
                icon={<WeekendIcon />}
                label={`${seats} ${t('seats')}`}
                color="primary"
                variant="outlined"
                size={size}
            />
            <Chip
                icon={<PeopleIcon />}
                label={`${candidatesCount} ${t('candidates')}`}
                color="default"
                variant="outlined"
                size={size}
            />
            {castedCount !== undefined ? (
                <Chip
                    icon={<HowToVoteIcon />}
                    label={`${castedCount}/${votersCount} ${t('cast')}`}
                    color={castedCount >= votersCount ? 'success' : 'default'}
                    size={size}
                />
            ) : (
                <Chip
                    icon={<HowToVoteIcon />}
                    label={`${votersCount} ${t('voters')}`}
                    color="default"
                    variant="outlined"
                    size={size}
                />
            )}
            <Chip
                label={isOpen ? t('Voting is open') : t('Voting is closed')}
                color={isOpen ? 'success' : 'default'}
                variant={isOpen ? 'filled' : 'outlined'}
                size={size}
            />
        </Stack>
    );
}
