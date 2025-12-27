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
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListItemButton from '@mui/material/ListItemButton';
import ScienceIcon from '@mui/icons-material/Science';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import LZString from "lz-string";
import * as yaml from "js-yaml";

import { getElection, ElectionState, Ballot, getBallot } from '../data/api';
import { BallotGroupDisplay } from '../components/BallotGroupDisplay';

interface ElectionDetailProps {
    electionId?: string;
}

export default function ElectionDetail({ electionId }: ElectionDetailProps) {
    const { t } = useTranslation();
    const [electionState, setElectionState] = useState<ElectionState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ballotGroups, setBallotGroups] = useState<Array<{ ballot: Ballot, count: number, uuids: string[] }>>([]);
    const [loadingBallots, setLoadingBallots] = useState(false);

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

            // Load and group ballots if available
            if (data.election.ballots && data.election.ballots.length > 0) {
                await loadAndGroupBallots(electionId, data.election.ballots);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const loadAndGroupBallots = async (electionId: string, ballotUuids: string[]) => {
        setLoadingBallots(true);
        try {
            // Fetch all ballots
            const ballots = await Promise.all(
                ballotUuids.map(uuid =>
                    getBallot(electionId, uuid).then(ballot => ({ uuid, ballot }))
                )
            );

            // Group ballots by identical rank patterns
            const groups = new Map<string, { ballot: Ballot, count: number, uuids: string[] }>();

            for (const { uuid, ballot } of ballots) {
                if (!ballot) continue;

                const key = JSON.stringify(ballot.ranks);
                const existing = groups.get(key);
                const ballotVotes = ballot.votes || 1; // Default to 1 if votes is undefined

                if (existing) {
                    existing.count += ballotVotes;
                    existing.uuids.push(uuid);
                } else {
                    groups.set(key, {
                        ballot: { ...ballot, votes: ballotVotes },
                        count: ballotVotes,
                        uuids: [uuid]
                    });
                }
            }

            // Sort by count descending and update ballot votes
            const sorted = Array.from(groups.values())
                .sort((a, b) => b.count - a.count)
                .map(group => ({
                    ...group,
                    ballot: { ...group.ballot, votes: group.count }
                }));

            setBallotGroups(sorted);
        } catch (err) {
            console.error('Failed to load ballots:', err);
        } finally {
            setLoadingBallots(false);
        }
    };

    const handleSimulate = () => {
        if (!electionState) return;

        const { election } = electionState;

        // Convert ballot groups to simulation format
        const simulationData = {
            candidates: election.candidates,
            seats: election.seats,
            ballots: ballotGroups.map(g => ({
                votes: g.count,
                ranks: g.ballot.ranks
            }))
        };

        const yamlText = yaml.dump(simulationData, { noRefs: true, sortKeys: false });
        const compressed = LZString.compressToEncodedURIComponent(yamlText);

        route(`/simulate?data=${compressed}`);
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

                {/* Hero Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {election.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                            icon={<EmojiEventsIcon />}
                            label={`${election.seats} ${t('seats')}`}
                            color="primary"
                            variant="outlined"
                        />
                        <Chip
                            icon={<PeopleIcon />}
                            label={`${election.number_of_ballots} ${t('voters')}`}
                            color="default"
                            variant="outlined"
                        />
                        <Chip
                            icon={<HowToVoteIcon />}
                            label={`${casted}/${potential_voters} ${t('cast')}`}
                            color={casted >= potential_voters ? 'success' : 'default'}
                        />
                        <Chip
                            label={votingClosed ? t('Voting is closed') : t('Voting is open')}
                            color={votingClosed ? 'default' : 'success'}
                            variant={votingClosed ? 'outlined' : 'filled'}
                        />
                    </Stack>
                </Box>

                {/* Voting Period Info */}
                <Alert severity={votingClosed ? 'info' : 'success'} sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        <strong>{t('Voting Period')}:</strong> {start.toLocaleString()} — {end.toLocaleString()}
                        {!votingClosed && ` • ${votingProgress.toFixed(0)}% ${t('turnout')}`}
                    </Typography>
                </Alert>

                {/* Results Section - Show first if voting closed */}
                {votingClosed && results && (
                    <Paper elevation={3} sx={{ p: 4, mb: 4, bgcolor: 'success.50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <EmojiEventsIcon sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
                            <Typography variant="h4" component="h2">
                                {t('Election Results')}
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            {results.elected.map((e, idx) => (
                                <Grid item xs={12} sm={6} md={4} key={e.id}>
                                    <Card elevation={2} sx={{ height: '100%' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{
                                                    bgcolor: 'success.main',
                                                    width: 56,
                                                    height: 56,
                                                    fontSize: '1.5rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {idx + 1}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" component="div">
                                                        {e.candidate}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('Position')} {idx + 1}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        {ballotGroups.length > 0 && (
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<ScienceIcon />}
                                    onClick={handleSimulate}
                                >
                                    {t('Open in Simulator')}
                                </Button>
                            </Box>
                        )}
                    </Paper>
                )}

                {/* Candidates List */}
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon /> {t('Candidates')}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {election.candidates.map((candidate, idx) => (
                            <Grid item xs={12} sm={6} md={4} key={idx}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    bgcolor: 'background.paper'
                                }}>
                                    <Avatar>{candidate.charAt(0).toUpperCase()}</Avatar>
                                    <Typography variant="body1">{candidate}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                {/* Ballot Groups */}
                {ballotGroups.length > 0 && (
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HowToVoteIcon /> {t('Ballot Groups')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {ballotGroups.length} {t('unique patterns')} • {ballotGroups.reduce((sum, g) => sum + g.count, 0)} {t('total votes')}
                            </Typography>
                        </Box>
                        {loadingBallots ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                {ballotGroups.map((group, groupIdx) => (
                                    <BallotGroupDisplay
                                        key={groupIdx}
                                        candidates={election.candidates}
                                        ballot={group.ballot}
                                        groupNumber={groupIdx + 1}
                                        readOnly={true}
                                        subtitle={`${group.uuids.length} ${group.uuids.length === 1 ? t('ballot') : t('ballots')}`}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Paper>
                )}

                {/* Individual Ballots List (Accordion) */}
                {election.ballots && election.ballots.length > 0 && (
                    <Accordion elevation={2} sx={{ mb: 3 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">
                                {t('Individual Ballots')} ({election.ballots.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {election.ballots.map((uuid) => (
                                    <ListItem key={uuid} disablePadding>
                                        <ListItemButton onClick={() => route(`/elections/${election.id}/ballot/${uuid}`)}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {uuid.substring(0, 2).toUpperCase()}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={uuid}
                                                secondary={t('Click to view ballot details')}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                )}

                {/* Election Log (Accordion) */}
                {results && (
                    <Accordion elevation={2} sx={{ mb: 3 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">
                                {t('Detailed Counting Log')}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box
                                component="pre"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    fontSize: '0.75rem',
                                    fontFamily: 'monospace',
                                    p: 2,
                                    bgcolor: 'background.default',
                                    borderRadius: 1,
                                    maxHeight: '400px',
                                    overflow: 'auto'
                                }}
                            >
                                {results.log}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
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
