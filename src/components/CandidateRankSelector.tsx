import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface CandidateRankSelectorProps {
  candidate: string;
  rank: number | null | undefined;
  maxRank: number;
  onChange: (rank: number | null) => void;
  readOnly?: boolean;
}

// Reusable rank picker using the ballot-style buttons.
export function CandidateRankSelector({
  candidate,
  rank,
  maxRank,
  onChange,
  readOnly = false,
}: CandidateRankSelectorProps) {
  const { t } = useTranslation();
  const rankOptions = Array.from({ length: maxRank }, (_, i) => i + 1);

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <Typography fontWeight="medium" flexGrow={1}>
          {candidate}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant={rank === null || rank === undefined ? 'contained' : 'outlined'}
            size="small"
            onClick={() => onChange(null)}
            disabled={readOnly}
          >
            {t('No preference')}
          </Button>
          {rankOptions.map(option => (
            <Button
              key={option}
              variant={rank === option ? 'contained' : 'outlined'}
              size="small"
              onClick={() => onChange(option)}
              disabled={readOnly}
            >
              {option}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
