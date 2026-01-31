import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

interface ElectionSeatsConfigProps {
  numSeats: number;
  orderedSeats: boolean;
  maxSeats?: number;
  onNumSeatsChange: (value: number) => void;
  onOrderedSeatsChange: (value: boolean) => void;
  disabled?: boolean;
  seatsError?: string | null;
}

export function ElectionSeatsConfig({
  numSeats,
  orderedSeats,
  maxSeats,
  onNumSeatsChange,
  onOrderedSeatsChange,
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
          'Ordered: Winners are ranked by position (1st, 2nd, 3rd, etc.). Unordered: Winners are identified without ranking them.'
        )}
        placement="right"
        arrow
      >
        <FormControlLabel
          control={
            <Switch
              checked={orderedSeats}
              onChange={e => onOrderedSeatsChange((e.target as HTMLInputElement).checked)}
              disabled={disabled}
            />
          }
          label={t('Rank elected candidates (ordered seats)')}
        />
      </Tooltip>
    </Stack>
  );
}
