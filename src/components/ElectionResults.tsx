import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ScienceIcon from '@mui/icons-material/Science';

interface Elected {
  id: number;
  candidate: string;
}

interface ElectionResultsProps {
  elected: Elected[];
  orderedSeats: boolean;
  onSimulate?: () => void;
  showSimulateButton?: boolean;
}

export function ElectionResults({
  elected,
  orderedSeats,
  onSimulate,
  showSimulateButton = false,
}: ElectionResultsProps) {
  const { t } = useTranslation();

  return (
    <Paper elevation={3}>
      <Stack spacing={3} padding={4} bgcolor="success.50">
        <Typography variant="h4" component="h2">
          {t('Results')}
        </Typography>
        <Grid container spacing={2}>
          {elected.map((e, idx) => (
            <Grid item xs={12} sm={6} md={4} key={e.id}>
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
                      {orderedSeats ? idx + 1 : e.candidate.charAt(0).toUpperCase()}
                    </Avatar>
                    <Stack>
                      <Typography variant="h6" component="div">
                        {e.candidate}
                      </Typography>
                      {orderedSeats && (
                        <Typography variant="body2" color="text.secondary">
                          {t('Position')} {idx + 1}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
