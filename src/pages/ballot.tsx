import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import SaveIcon from '@mui/icons-material/Save';

import { getBallot, putBallot, getElection, Ballot as ApiBallot, ElectionState } from '../data/api';
import { CandidateRankSelector } from '../components/CandidateRankSelector';

interface BallotPageProps {
    path?: string;
    electionId?: string;
    ballotUuid?: string;
}

export default function BallotPage({ electionId, ballotUuid }: BallotPageProps) {
    const { t } = useTranslation();
    const [ballot, setBallot] = useState<ApiBallot | null>(null);
    const [electionData, setElectionData] = useState<ElectionState | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (electionData) {
            document.title = `${electionData.election.title} - ${t('App title')}`;
        }
    }, [electionData, t]);

    useEffect(() => {
        if (electionId && ballotUuid) {
            loadData();
        }
    }, [electionId, ballotUuid]);

    const loadData = async () => {
        if (!electionId || !ballotUuid) return;

        try {
            setLoading(true);
            setError(null);

            // Load election info to get candidates and period
            const electionDataResp = await getElection(electionId);
            setElectionData(electionDataResp);

            // Try to load existing ballot
            const ballotData = await getBallot(electionId, ballotUuid);
            if (ballotData) {
                // If ranks is null, initialize it with empty array
                if (ballotData.ranks === null) {
                    ballotData.ranks = Array(electionDataResp.election.candidates.length).fill(null);
                }
                setBallot(ballotData);
            } else {
                // Initialize empty ballot
                setBallot({
                    votes: 1,
                    ranks: Array(electionDataResp.election.candidates.length).fill(null)
                });
            }
        } catch (err) {
            // Check if it's a "not found" error (ballot UUID is invalid)
            const errorMsg = err instanceof Error ? err.message : String(err);
            if (errorMsg.includes('Not found') || errorMsg.includes('404')) {
                setError(t('This ballot id does not exist'));
            } else {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!electionId || !ballotUuid || !ballot) return;

        try {
            setSaving(true);
            setError(null);

            await putBallot(electionId, ballotUuid, ballot);
            setSuccess(true); // Mark as saved
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSaving(false);
        }
    };

    const handleRankChange = (candidateIdx: number, rank: number | null) => {
        if (!ballot) return;
        const start = electionData ? new Date(electionData.election.start_time) : null;
        const end = electionData ? new Date(electionData.election.end_time) : null;
        const now = new Date();
        const readOnly = !!(start && end) && (now < start || now >= end);
        if (readOnly) return;
        const newRanks = [...ballot.ranks];
        newRanks[candidateIdx] = rank;
        setBallot({ ...ballot, ranks: newRanks });
        setSuccess(false); // Mark ballot as unsaved after changes
    };

    if (!electionId || !ballotUuid) {
        return (
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    <Alert severity="error">
                        {t('Invalid ballot URL')}
                    </Alert>
                </Box>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container maxWidth="md">
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error && !ballot) {
        return (
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    <Alert severity="error">
                        {t('Error loading ballot')}: {error}
                    </Alert>
                </Box>
            </Container>
        );
    }

    if (!ballot) {
        return (
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    <Alert severity="info">
                        {t('Ballot not found')}
                    </Alert>
                </Box>
            </Container>
        );
    }

    const candidates = electionData?.election.candidates ?? [];
    const maxRank = candidates.length;
    const startTime = electionData ? new Date(electionData.election.start_time) : null;
    const endTime = electionData ? new Date(electionData.election.end_time) : null;
    const now = new Date();
    const readOnly = !!(startTime && endTime) && (now < startTime || now >= endTime);

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {t('Private Ballot: Do not share this page URL with anyone. This link is unique to your vote and should be kept confidential.')}
                </Alert>

                <Typography variant="h3" component="h1" gutterBottom>
                    {t('Cast Your Ballot')}
                </Typography>

                <Typography variant="h5" color="text.secondary" gutterBottom>
                    {electionData?.election.title}
                </Typography>

                {electionData && startTime && endTime && (
                    <Alert severity={readOnly ? 'warning' : 'info'} sx={{ my: 2 }}>
                        {t('Voting Period')}: {startTime.toLocaleString()} — {endTime.toLocaleString()} {readOnly ? `• ${t('Voting is closed')}` : `• ${t('Voting is open')}`}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ my: 2 }}>
                        {t('Ballot saved successfully!')}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {t('Error saving ballot')}: {error}
                    </Alert>
                )}

                <Paper elevation={2} sx={{ p: 3, my: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t('Rank the candidates')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t('Select your preferred rank for each candidate. 1 is most preferred.')}
                    </Typography>

                    <Stack spacing={2}>
                        {candidates.map((candidate, idx) => (
                            <CandidateRankSelector
                                key={idx}
                                candidate={candidate}
                                rank={ballot.ranks[idx]}
                                maxRank={maxRank}
                                readOnly={readOnly}
                                onChange={(rank) => handleRankChange(idx, rank)}
                            />
                        ))}
                    </Stack>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={saving || readOnly}
                    >
                        {saving ? t('Saving...') : readOnly ? t('Voting is closed') : t('Submit Ballot')}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
