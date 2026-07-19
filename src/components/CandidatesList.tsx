import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { ElectionType, GroupConfig } from '../data/api';

interface CandidatesListProps {
  candidates: string[];
  electionType: ElectionType;
  groups?: GroupConfig[];
  candidateGroups?: string[];
  onCandidateChange: (index: number, value: string) => void;
  onCandidateGroupChange?: (index: number, group: string) => void;
  onAddCandidate: () => void;
  onRemoveCandidate: (index: number) => void;
  disabled?: boolean;
  candidatesError?: string | null;
}

export function CandidatesList({
  candidates,
  electionType,
  groups,
  candidateGroups,
  onCandidateChange,
  onCandidateGroupChange,
  onAddCandidate,
  onRemoveCandidate,
  disabled = false,
  candidatesError = null,
}: CandidatesListProps) {
  const { t } = useTranslation();
  const isGrouped = electionType === 'stv-md-grouped';

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
          <Stack key={index} direction="row" spacing={1} alignItems="center">
            <TextField
              label={`${t('Candidate')} ${index + 1}`}
              value={candidate}
              onChange={e => onCandidateChange(index, (e.target as HTMLInputElement).value)}
              fullWidth
              size="small"
              disabled={disabled}
            />
            {isGrouped && groups && onCandidateGroupChange && (
              <Tooltip
                title={t('Assign each candidate to a group. Candidates in each group compete only for the seats allocated to that group.')}
                arrow
                placement="left"
              >
                <Select
                  value={candidateGroups?.[index] ?? ''}
                  onChange={e => onCandidateGroupChange(index, (e.target as HTMLSelectElement).value)}
                  displayEmpty
                  size="small"
                  disabled={disabled}
                  sx={{ minWidth: 120 }}
                  renderValue={(selected) => {
                    if (!selected) return <em style={{ color: '#999' }}>{t('Group')}</em>;
                    return selected;
                  }}
                >
                  {groups.map((g) => (
                    <MenuItem key={g.name} value={g.name}>{g.name}</MenuItem>
                  ))}
                </Select>
              </Tooltip>
            )}
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
