import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import { route } from 'preact-router';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListItemButton from '@mui/material/ListItemButton';

import { getElection, ElectionState } from '../data/api';

interface ElectionDetailProps {
    electionId?: string;
}

export default function ElectionDetail({ electionId }: ElectionDetailProps) {
    const { t } = useTranslation();
    const [electionState, setElectionState] = useState<ElectionState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (electionId) {
            loadElection();
        }
    }, [electionId]);

    const loadElection = async () => {
        if (!electionId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await getElection(electionId);
            setElectionState(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        route('/elections');
    };

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                        sx={{ mb: 2 }}
                    >
                        {t('Back to elections')}
                    </Button>
                    <Alert severity="error">
                        {t('Error loading election')}: {error}
                    </Alert>
                </Box>
            </Container>
        );
    }

    if (!electionState) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                        sx={{ mb: 2 }}
                    >
                        {t('Back to elections')}
                    </Button>
                    <Alert severity="info">
                        {t('Election not found')}
                    </Alert>
                </Box>
            </Container>
        );
    }

    const { election, potential_voters, casted, results } = electionState;
    const start = new Date(election.start_time);
    const end = new Date(election.end_time);
    const now = new Date();
    const votingClosed = now < start || now >= end;
    const votingProgress = potential_voters > 0 ? (casted / potential_voters) * 100 : 0;

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ mb: 2 }}
                >
                    {t('Back to elections')}
                </Button>

                <Typography variant="h3" component="h1" gutterBottom>
                    {election.name}
                </Typography>

                {/* Election Stats */}
                <Paper elevation={2} sx={{ p: 3, my: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        {t('Election Information')}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Chip
                            label={`${election.seats} ${t('seats')}`}
                            color="primary"
                        />
                        <Chip
                            label={`${election.number_of_ballots} ${t('voters')}`}
                            color="default"
                        />
                        <Chip
                            label={`${casted} / ${potential_voters} ${t('votes cast')}`}
                            color={casted >= potential_voters ? 'success' : 'default'}
                        />
                        <Chip
                            label={`${votingProgress.toFixed(1)}% ${t('turnout')}`}
                            color={votingProgress >= 50 ? 'success' : 'warning'}
                        />
                        <Chip
                            label={`${t('Voting Period')}: ${start.toLocaleString()} — ${end.toLocaleString()}`}
                            color={votingClosed ? 'default' : 'info'}
                        />
                    </Stack>
                </Paper>

                {/* Candidates */}
                <Paper elevation={2} sx={{ p: 3, my: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        {t('Candidates')}
                    </Typography>
                    <List>
                        {election.candidates.map((candidate, idx) => (
                            <ListItem key={idx}>
                                <ListItemAvatar>
                                    <Avatar>{candidate.charAt(0).toUpperCase()}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={candidate} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {/* Public Ballots (after election ends) */}
                {election.ballots && election.ballots.length > 0 && (
                    <Paper elevation={2} sx={{ p: 3, my: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            {t('Public Ballots')}
                        </Typography>
                        <List>
                            {election.ballots.map((uuid) => (
                                <ListItem key={uuid} disablePadding>
                                    <ListItemButton onClick={() => route(`/elections/${election.id}/ballot/${uuid}`)}>
                                        <ListItemAvatar>
                                            <Avatar>{uuid.substring(0, 2).toUpperCase()}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={uuid} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}

                {/* Results */}
                {results && (
                    <>
                        <Paper elevation={2} sx={{ p: 3, my: 3 }}>
                            <Typography variant="h5" gutterBottom>
                                {t('Elected Candidates')}
                            </Typography>
                            <List>
                                {results.elected.map((e, idx) => (
                                    <ListItem key={e.id}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'success.main' }}>
                                                {idx + 1}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={e.candidate}
                                            secondary={`${t('Position')}: ${idx + 1}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>

                        <Paper elevation={2} sx={{ p: 3, my: 3 }}>
                            <Typography variant="h5" gutterBottom>
                                {t('Election Log')}
                            </Typography>
                            <Box
                                component="pre"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    fontSize: '0.875rem',
                                    fontFamily: 'monospace',
                                    p: 2,
                                    bgcolor: 'background.default',
                                    borderRadius: 1
                                }}
                            >
                                {results.log}
                            </Box>
                        </Paper>
                    </>
                )}

                {!results && (
                    <Alert severity="info" sx={{ my: 3 }}>
                        {t('Results will be available after voting is complete')}
                    </Alert>
                )}
            </Box>
        </Container>
    );
}
