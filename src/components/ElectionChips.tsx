import { useTranslation } from 'react-i18next';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
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
  size = 'medium',
}: ElectionChipsProps) {
  const { t } = useTranslation();

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  const isOpen = now >= start && now < end;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={[
        size === 'small'
          ? {
              mt: 1,
            }
          : {
              mt: 2,
            },
        { flexWrap: 'wrap' },
      ]}
    >
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
          color="default"
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
      <Tooltip
        title={
          isOpen
            ? t('The election is open for voting - each individual vote is secret')
            : t('Voting is closed - results are public, but individual votes stay secret')
        }
      >
        <Chip
          label={isOpen ? t('Voting is open') : t('Voting is closed')}
          color={isOpen ? 'success' : 'default'}
          variant={isOpen ? 'filled' : 'outlined'}
          size={size}
        />
      </Tooltip>
    </Stack>
  );
}
