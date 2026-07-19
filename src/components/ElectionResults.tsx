import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import ScienceIcon from '@mui/icons-material/Science';
import type { ElectionType, GroupConfig, GroupResult } from '../data/api';

interface Elected {
  id: number;
  candidate: string;
}

interface ElectionResultsProps {
  elected: Elected[];
  electionType: ElectionType;
  onSimulate?: () => void;
  showSimulateButton?: boolean;
  groups?: GroupConfig[];
  groupResults?: GroupResult[];
}

function ECard({ name, idx, isOrdered }: { name: string; idx: number; isOrdered: boolean }) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: 'success.main',
              width: 56,
              height: 56,
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
          >
            {isOrdered ? idx + 1 : name.charAt(0).toUpperCase()}
          </Avatar>
          <Stack>
            <Typography variant="h6" component="div">
              {name}
            </Typography>
            {isOrdered && (
              <Typography variant="body2" color="text.secondary">
                {idx + 1}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ElectionResults({
  elected,
  electionType,
  onSimulate,
  showSimulateButton = false,
  groups,
  groupResults,
}: ElectionResultsProps) {
  const { t } = useTranslation();
  const isOrdered = electionType === 'stv-md-coperland';
  const isGrouped = electionType === 'stv-md-grouped';

  return (
    <Paper elevation={3}>
      <Stack spacing={3} padding={4} bgcolor="success.50">
        <Typography variant="h4" component="h2">
          {t('Results')}
        </Typography>

        {isGrouped && groupResults && groups ? (
          // Grouped display
          <Stack spacing={3}>
            {groupResults.map((gr) => (
              <Paper key={gr.group} elevation={1} sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h5" component="h3">
                    {t('Group')}: {gr.group}
                  </Typography>
                  <Chip label={`${gr.seats} ${t('seats')}`} color="primary" variant="outlined" />
                </Stack>
                <Grid container spacing={2}>
                  {gr.elected.map((e, idx) => (
                    <Grid key={e.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <ECard name={e.candidate} idx={idx} isOrdered={false} />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ))}
            <Divider />
            <Typography variant="h5" component="h3">
              {t('All Elected')}
            </Typography>
            <Grid container spacing={2}>
              {elected.map((e, idx) => (
                <Grid key={e.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ECard name={e.candidate} idx={idx} isOrdered={false} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        ) : (
          // Non-grouped display
          <Grid container spacing={2}>
            {elected.map((e, idx) => (
              <Grid key={e.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ECard name={e.candidate} idx={idx} isOrdered={isOrdered} />
              </Grid>
            ))}
          </Grid>
        )}

        {showSimulateButton && onSimulate && (
          <Stack alignItems="center">
            <Button
              variant="outlined"
              size="large"
              startIcon={<ScienceIcon />}
              onClick={onSimulate}
            >
              {t('Open in Simulator')}
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
