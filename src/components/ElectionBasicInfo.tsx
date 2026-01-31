import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

interface ElectionBasicInfoProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
  titleError?: string | null;
}

export function ElectionBasicInfo({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  disabled = false,
  titleError = null,
}: ElectionBasicInfoProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <TextField
        label={t('Election Title')}
        value={title}
        onChange={e => onTitleChange((e.target as HTMLInputElement).value)}
        fullWidth
        required
        disabled={disabled}
        error={!!titleError}
        helperText={titleError}
      />

      <TextField
        label={t('Description')}
        value={description}
        onChange={e => onDescriptionChange((e.target as HTMLInputElement).value)}
        fullWidth
        multiline
        rows={3}
        disabled={disabled}
      />
    </Stack>
  );
}
