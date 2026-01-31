import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface CandidatesListProps {
  candidates: string[];
  onCandidateChange: (index: number, value: string) => void;
  onAddCandidate: () => void;
  onRemoveCandidate: (index: number) => void;
  disabled?: boolean;
  candidatesError?: string | null;
}

export function CandidatesList({
  candidates,
  onCandidateChange,
  onAddCandidate,
  onRemoveCandidate,
  disabled = false,
  candidatesError = null,
}: CandidatesListProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Tooltip
          title={<span style={{ whiteSpace: 'pre-line' }}>{t('addCandidatesInstructions')}</span>}
          arrow
          placement="right"
        >
          <IconButton size="small">
            <InfoOutlinedIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Button startIcon={<AddIcon />} size="small" onClick={onAddCandidate} disabled={disabled}>
          {t('Add Candidate')}
        </Button>
      </Stack>

      <Stack spacing={1}>
        {candidates.map((candidate, index) => (
          <Stack key={index} direction="row" spacing={1}>
            <TextField
              label={`${t('Candidate')} ${index + 1}`}
              value={candidate}
              onChange={e => onCandidateChange(index, (e.target as HTMLInputElement).value)}
              fullWidth
              size="small"
              disabled={disabled}
            />
            <IconButton
              onClick={() => onRemoveCandidate(index)}
              disabled={disabled || candidates.length <= 1}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      {candidatesError && (
        <Typography variant="caption" color="error" display="block">
          {candidatesError}
        </Typography>
      )}
    </Stack>
  );
}
