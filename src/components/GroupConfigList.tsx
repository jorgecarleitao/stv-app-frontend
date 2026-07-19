import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { GroupConfig } from '../data/api';

interface GroupConfigListProps {
  groups: GroupConfig[];
  onGroupsChange: (groups: GroupConfig[]) => void;
  disabled?: boolean;
}

export function GroupConfigList({
  groups,
  onGroupsChange,
  disabled = false,
}: GroupConfigListProps) {
  const { t } = useTranslation();

  const handleNameChange = (idx: number, name: string) => {
    const next = [...groups];
    next[idx] = { ...next[idx], name };
    onGroupsChange(next);
  };

  const handleSeatsChange = (idx: number, seats: number) => {
    const next = [...groups];
    next[idx] = { ...next[idx], seats };
    onGroupsChange(next);
  };

  const handleAdd = () => {
    onGroupsChange([...groups, { name: '', seats: 1 }]);
  };

  const handleRemove = (idx: number) => {
    onGroupsChange(groups.filter((_, i) => i !== idx));
  };

  return (
    <Stack spacing={1}>
      {groups.map((g, idx) => (
        <Stack key={idx} direction="row" spacing={1} alignItems="center">
          <TextField
            label={`${t('Group')} ${idx + 1}`}
            value={g.name}
            onChange={e => handleNameChange(idx, (e.target as HTMLInputElement).value)}
            size="small"
            disabled={disabled}
            sx={{ flex: 1 }}
          />
          <TextField
            label={t('Seats')}
            type="number"
            value={g.seats}
            onChange={e => handleSeatsChange(idx, Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1))}
            size="small"
            disabled={disabled}
            inputProps={{ min: 1 }}
            sx={{ width: 100 }}
          />
          <IconButton
            onClick={() => handleRemove(idx)}
            disabled={disabled || groups.length <= 1}
            color="error"
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      {groups.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {t('No groups defined')}
        </Typography>
      )}
      <Button startIcon={<AddIcon />} size="small" onClick={handleAdd} disabled={disabled}>
        {t('Add Group')}
      </Button>
    </Stack>
  );
}
