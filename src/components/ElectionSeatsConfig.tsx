import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { ElectionType } from '../data/types';
import { systems } from '../systems';

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
  const fixedSeats = systems[electionType].fixedSeats;

  return (
    <Stack spacing={2}>
      {fixedSeats != null ? (
        <TextField
          label={t('Number of Seats')}
          type="number"
          value={fixedSeats}
          fullWidth
          disabled
          helperText={t('Single-winner election: exactly one winner is elected')}
        />
      ) : (
        <TextField
          label={t('Number of Seats')}
          type="number"
          value={numSeats}
          onChange={e => onNumSeatsChange(parseInt((e.target as HTMLInputElement).value) || 1)}
          fullWidth
          required
          slotProps={{ htmlInput: { min: 1, max: maxSeats } }}
          disabled={disabled}
          error={!!seatsError}
          helperText={seatsError}
        />
      )}

      <Tooltip
        title={t(
          'STV-MD: Winners are identified without ranking. STV-MD Copeland: Winners are ranked by position using pairwise comparison. STV-MD Grouped: Candidates are split into groups and STV is run independently per group. Schulze: A single winner is elected by beatpath (Condorcet); ties are broken by a seeded random lot.'
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
            onChange={e =>
              onElectionTypeChange((e.target as HTMLSelectElement).value as ElectionType)
            }
          >
            {Object.values(systems).map(s => (
              <MenuItem key={s.id} value={s.id}>
                {t(s.label)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Tooltip>
    </Stack>
  );
}
