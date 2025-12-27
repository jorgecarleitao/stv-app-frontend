import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import { route } from 'preact-router';

import Container from '@mui/material/Container';
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
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import Divider from '@mui/material/Divider';

import { listElections, ElectionConfig } from '../data/api';

export default function ElectionList() {
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

    const handleElectionClick = (electionId: string) => {
        route(`/elections/${electionId}`);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    {t('Elections')}
                </Typography>

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
                                        <ListItemButton onClick={() => handleElectionClick(election.id)}>
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <HowToVoteIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={election.name}
                                                secondary={(() => {
                                                    const start = new Date(election.start_time);
                                                    const end = new Date(election.end_time);
                                                    const now = new Date();
                                                    const isOpen = now >= start && now < end;
                                                    const status = isOpen ? t('Voting is open') : t('Voting is closed');
                                                    const period = `${t('Voting Period')}: ${start.toLocaleDateString()} — ${end.toLocaleDateString()}`;
                                                    const basics = `${election.candidates.length} ${t('candidates')} • ${election.seats} ${t('seats')} • ${election.number_of_ballots} ${t('voters')}`;
                                                    return [basics, status, period].join(' • ');
                                                })()}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>
        </Container>
    );
}
