import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import { Page } from '../components/Page';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import Divider from '@mui/material/Divider';

import { listElections, ElectionConfig } from '../data/api';
import { ElectionChips } from '../components/ElectionChips';

interface ElectionListProps {
  path?: string;
}

export default function ElectionList({ path }: ElectionListProps) {
  const { t } = useTranslation();
  const [elections, setElections] = useState<ElectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listElections();
      setElections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title={t('Elections')} description={t('Elections meta description')}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -6, mb: 2 }}>
        <Button component="a" href="/elections/create" variant="contained" startIcon={<AddIcon />}>
          {t('Create Election')}
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {t('Error loading elections')}: {error}
        </Alert>
      )}

      {!loading && !error && elections.length === 0 && (
        <Alert severity="info" sx={{ my: 2 }}>
          {t('No elections available')}
        </Alert>
      )}

      {!loading && !error && elections.length > 0 && (
        <Paper elevation={2} sx={{ mt: 3 }}>
          <List>
            {elections.map((election, index) => (
              <>
                {index > 0 && <Divider />}
                <ListItem key={election.id} disablePadding>
                  <ListItemButton component="a" href={`/elections/${election.id}`}>
                    <ListItemAvatar>
                      <Avatar>
                        <HowToVoteIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={election.title}
                      secondary={
                        election.description ? (
                          <>
                            {election.description}
                            <ElectionChips
                              seats={election.seats}
                              candidatesCount={election.candidates.length}
                              votersCount={election.number_of_ballots}
                              startTime={election.start_time}
                              endTime={election.end_time}
                              size="small"
                            />
                          </>
                        ) : (
                          <ElectionChips
                            seats={election.seats}
                            candidatesCount={election.candidates.length}
                            votersCount={election.number_of_ballots}
                            startTime={election.start_time}
                            endTime={election.end_time}
                            size="small"
                          />
                        )
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </>
            ))}
          </List>
        </Paper>
      )}
    </Page>
  );
}
