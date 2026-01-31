import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface ElectionTimeConfigProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  disabled?: boolean;
  dateTimeError?: string | null;
}

export function ElectionTimeConfig({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  disabled = false,
  dateTimeError = null,
}: ElectionTimeConfigProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <TextField
        label={t('Start Time')}
        type="datetime-local"
        value={startTime}
        onChange={e => onStartTimeChange((e.target as HTMLInputElement).value)}
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
        disabled={disabled}
        error={!!dateTimeError}
      />

      <TextField
        label={t('End Time')}
        type="datetime-local"
        value={endTime}
        onChange={e => onEndTimeChange((e.target as HTMLInputElement).value)}
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
        disabled={disabled}
        error={!!dateTimeError}
      />

      {dateTimeError && (
        <Typography variant="caption" color="error" display="block">
          {dateTimeError}
        </Typography>
      )}
    </Stack>
  );
}
