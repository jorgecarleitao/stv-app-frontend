import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';

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
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListItemButton from '@mui/material/ListItemButton';
import ScienceIcon from '@mui/icons-material/Science';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

import LZString from "lz-string";
import * as yaml from "js-yaml";

import { ElectionChips } from '../components/ElectionChips';

import { getElection, ElectionState } from '../data/api';
import { BallotGroupDisplay } from '../components/BallotGroupDisplay';

// Convert API ranks (0-based) to UI ranks (1-based)
function fromApiRanks(ranks: (number | null)[]): (number | null)[] {
    return ranks.map(r => r === null ? null : r + 1);
}

interface ElectionDetailProps {
    path?: string;
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

    useEffect(() => {
        if (electionState) {
            document.title = `${electionState.election.title} - ${t('App title')}`;
        }
    }, [electionState, t]);

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



    const handleSimulate = () => {
        if (!electionState?.results?.election) return;

        // Use election data directly from results
        const yamlText = yaml.dump(electionState.results.election, { noRefs: true, sortKeys: false });
        const compressed = LZString.compressToEncodedURIComponent(yamlText);

        window.location.href = `/simulate?data=${compressed}`;
    };

    const handleBack = () => {
        window.location.href = '/elections';
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
                        {election.title}
                    </Typography>
                    {election.description && (
                        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 2 }}>
                            {election.description}
                        </Typography>
                    )}
                    <ElectionChips
                        seats={election.seats}
                        candidatesCount={election.candidates.length}
                        votersCount={potential_voters}
                        castedCount={casted}
                        startTime={election.start_time}
                        endTime={election.end_time}
                    />
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
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h4" component="h2">
                                {t('Results')}
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
                        {results.election.ballots.length > 0 && (
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

                {/* Pairwise Comparison Matrix */}
                {votingClosed && results && results.pairwise_matrix && results.order && (
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            {t('Pairwise Comparison Matrix')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {t('Each cell shows how many voters preferred the row candidate over the column candidate')}
                        </Typography>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Box component="table" sx={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                '& td, & th': {
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    p: 1.5,
                                    textAlign: 'center',
                                    minWidth: '80px'
                                },
                                '& th': {
                                    bgcolor: 'action.hover',
                                    fontWeight: 'bold',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 1
                                },
                                '& tbody th': {
                                    position: 'sticky',
                                    left: 0,
                                    bgcolor: 'action.hover',
                                    zIndex: 1
                                }
                            }}>
                                <Box component="thead">
                                    <Box component="tr">
                                        <Box component="th" sx={{ minWidth: '120px !important' }}></Box>
                                        {election.candidates.map((candidate, idx) => (
                                            <Box component="th" key={idx}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                    <Avatar sx={{
                                                        width: 24,
                                                        height: 24,
                                                        fontSize: '0.75rem',
                                                        bgcolor: 'primary.main'
                                                    }}>
                                                        {results.order[idx] + 1}
                                                    </Avatar>
                                                    <Typography variant="caption">{candidate}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                                <Box component="tbody">
                                    {election.candidates.map((candidate, rowIdx) => (
                                        <Box component="tr" key={rowIdx}>
                                            <Box component="th">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}>
                                                    <Avatar sx={{
                                                        width: 24,
                                                        height: 24,
                                                        fontSize: '0.75rem',
                                                        bgcolor: 'primary.main'
                                                    }}>
                                                        {results.order[rowIdx] + 1}
                                                    </Avatar>
                                                    <Typography variant="body2">{candidate}</Typography>
                                                </Box>
                                            </Box>
                                            {election.candidates.map((_, colIdx) => {
                                                const value = results.pairwise_matrix[rowIdx][colIdx];
                                                const opposite = results.pairwise_matrix[colIdx][rowIdx];
                                                const isWin = rowIdx !== colIdx && value > opposite;
                                                const isTie = rowIdx !== colIdx && value === opposite;

                                                return (
                                                    <Box
                                                        component="td"
                                                        key={colIdx}
                                                        sx={{
                                                            bgcolor: rowIdx === colIdx
                                                                ? 'action.disabledBackground'
                                                                : isWin
                                                                    ? 'success.50'
                                                                    : isTie
                                                                        ? 'warning.50'
                                                                        : 'inherit',
                                                            fontWeight: isWin ? 'bold' : 'normal'
                                                        }}
                                                    >
                                                        {rowIdx === colIdx ? '—' : value}
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                            {t('Candidates are ordered by their final ranking (Copeland method). Green cells indicate wins, yellow indicates ties.')}
                        </Typography>
                    </Paper>
                )}

                {/* Ballot Groups (Accordion) */}
                {results && results.election.ballots.length > 0 && (
                    <Accordion elevation={2} sx={{ mb: 3 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <HowToVoteIcon /> {t('Ballot Groups')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {results.election.ballots.length} {t('unique patterns')} • {results.election.ballots.reduce((sum, b) => sum + b.votes, 0)} {t('total votes')}
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={2}>
                                {results.election.ballots.map((ballot, idx) => (
                                    <BallotGroupDisplay
                                        key={idx}
                                        candidates={results.election.candidates}
                                        ballot={{ ...ballot, ranks: fromApiRanks(ballot.ranks) }}
                                        groupNumber={idx + 1}
                                        readOnly={true}
                                        subtitle={`${ballot.votes} ${ballot.votes === 1 ? t('vote') : t('votes')}`}
                                    />
                                ))}
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
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
                                        <ListItemButton
                                            component="a"
                                            href={`/elections/${election.id}/ballot/${uuid}`}
                                        >
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
