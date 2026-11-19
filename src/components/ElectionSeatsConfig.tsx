import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import ListItemText from '@mui/material/ListItemText';
import { ElectionType } from '../data/types';
import { getSystem, getGoalBySystemId, goals } from '../systems';

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
  const fixedSeats = getSystem(electionType).fixedSeats;
  const goal = getGoalBySystemId(electionType);

  return (
    <Stack spacing={2}>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="election-goal-label">{t('What do you want to elect?')}</InputLabel>
        <Select
          labelId="election-goal-label"
          value={electionType}
          label={t('What do you want to elect?')}
          onChange={e =>
            onElectionTypeChange((e.target as HTMLSelectElement).value as ElectionType)
          }
        >
          {goals.map(g => (
            <MenuItem key={g.id} value={g.systemId}>
              <ListItemText primary={t(g.titleKey)} secondary={t(getSystem(g.systemId).label)} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{t(goal.descKey)}</FormHelperText>
      </FormControl>

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
    </Stack>
  );
}
