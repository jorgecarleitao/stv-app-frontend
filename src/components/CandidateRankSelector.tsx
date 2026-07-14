import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const COMPACT_THRESHOLD = 6;

interface CandidateRankSelectorProps {
  candidate: string;
  rank: number | null | undefined;
  maxRank: number;
  onChange: (rank: number | null) => void;
  readOnly?: boolean;
}

// Reusable rank picker: buttons for small lists, dropdown for large ones.
export function CandidateRankSelector({
  candidate,
  rank,
  maxRank,
  onChange,
  readOnly = false,
}: CandidateRankSelectorProps) {
  const { t } = useTranslation();
  const useCompact = maxRank > COMPACT_THRESHOLD;

  if (useCompact) {
    const selectId = `rank-${candidate}`;
    const selectValue = (rank == null ? '' : String(rank)) as string;

    const handleChange = (e: SelectChangeEvent) => {
      const val = (e.target as { value: string }).value;
      onChange(val === '' ? null : Number(val));
    };

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Typography fontWeight="medium" flexGrow={1} noWrap>
          {candidate}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 130 }} disabled={readOnly}>
          <InputLabel id={`${selectId}-label`}>{t('Rank')}</InputLabel>
          <Select
            labelId={`${selectId}-label`}
            id={selectId}
            value={selectValue}
            label={t('Rank')}
            onChange={handleChange}
          >
            <MenuItem value="">{t('No preference')}</MenuItem>
            {Array.from({ length: maxRank }, (_, i) => i + 1).map(option => (
              <MenuItem key={option} value={String(option)}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  }

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
