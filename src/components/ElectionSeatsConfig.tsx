import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import type { ElectionType } from '../data/api';

interface ElectionSeatsConfigProps {
  numSeats: number;
  electionType: ElectionType;
  maxSeats?: number;
  onNumSeatsChange: (value: number) => void;
  onElectionTypeChange: (value: ElectionType) => void;
  disabled?: boolean;
  seatsError?: string | null;
}

export function ElectionSeatsConfig({
  numSeats,
  electionType,
  maxSeats,
  onNumSeatsChange,
  onElectionTypeChange,
  disabled = false,
  seatsError = null,
}: ElectionSeatsConfigProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <TextField
        label={t('Number of Seats')}
        type="number"
        value={numSeats}
        onChange={e => onNumSeatsChange(parseInt((e.target as HTMLInputElement).value) || 1)}
        fullWidth
        required
        inputProps={{ min: 1, max: maxSeats }}
        disabled={disabled}
        error={!!seatsError}
        helperText={seatsError}
      />

      <Tooltip
        title={t(
          'STV-MD: Winners are identified without ranking. STV-MD Copeland: Winners are ranked by position using pairwise comparison.'
        )}
        placement="right"
        arrow
      >
        <FormControl fullWidth disabled={disabled}>
          <InputLabel id="election-type-label">{t('Election Type')}</InputLabel>
          <Select
            labelId="election-type-label"
            value={electionType}
            label={t('Election Type')}
            onChange={e => onElectionTypeChange(e.target.value as ElectionType)}
          >
            <MenuItem value="stv-md">{t('STV-MD (unordered)')}</MenuItem>
            <MenuItem value="stv-md-coperland">{t('STV-MD Copeland (ordered)')}</MenuItem>
          </Select>
        </FormControl>
      </Tooltip>
    </Stack>
  );
}
