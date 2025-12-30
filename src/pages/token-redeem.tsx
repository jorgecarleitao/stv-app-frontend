import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

import { redeemToken, getTokenInfo, getElection, ElectionState } from '../data/api';

interface TokenRedeemProps {
    path?: string;
    electionId?: string;
    tokenId?: string;
}

export default function TokenRedeem({ electionId, tokenId }: TokenRedeemProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [alreadyRedeemed, setAlreadyRedeemed] = useState(false);
    const [electionData, setElectionData] = useState<ElectionState | null>(null);

    useEffect(() => {
        if (electionData) {
            document.title = `${electionData.title} - ${t('STV election runner')}`;
        }
    }, [electionData, t]);

    useEffect(() => {
        if (electionId && tokenId) {
            checkTokenStatus();
        }
    }, [electionId, tokenId]);

    const checkTokenStatus = async () => {
        if (!electionId || !tokenId) return;

        try {
            setLoading(true);
            setError(null);
            const [tokenInfo, election] = await Promise.all([
                getTokenInfo(electionId, tokenId),
                getElection(electionId)
            ]);
            setAlreadyRedeemed(!!tokenInfo.converted_at);
            setElectionData(election);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!electionId || !tokenId) return;

        try {
            setRedeeming(true);
            setError(null);
            const ballotId = await redeemToken(electionId, tokenId);
            // Redirect to ballot page
            window.location.href = `/elections/${electionId}/ballot/${ballotId}`;
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setRedeeming(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md">
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        {alreadyRedeemed ? (
                            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                        ) : (
                            <HowToVoteIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        )}
                        <Typography variant="h4" component="h1" gutterBottom>
                            {alreadyRedeemed ? t('Token Already Redeemed') : t('Vote')}
                        </Typography>
                    </Box>

                    {alreadyRedeemed ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            {t('This token has already been redeemed. Each token can only be used once. If you previously redeemed this token, you should have received a ballot link.')}
                        </Alert>
                    ) : (
                        <>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                {t('You have been invited to vote in this election. Click the button below to access your ballot.')}
                            </Alert>

                            {electionData && (
                                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h5" gutterBottom>
                                        {electionData.election.name}
                                    </Typography>
                                    {electionData.election.description && (
                                        <Typography variant="body1" color="text.secondary" paragraph>
                                            {electionData.election.description}
                                        </Typography>
                                    )}
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle1" gutterBottom>
                                        {t('Candidates')}:
                                    </Typography>
                                    <List dense>
                                        {electionData.election.candidates.map((candidate, index) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={candidate} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            )}

                            <Alert severity="warning" sx={{ mb: 3 }}>
                                {t('Important: After continuing, you will receive a unique link to your ballot. This current link will no longer work. Do not share the ballot link with anyone, as it allows direct access to your vote.')}
                            </Alert>

                            <Box sx={{ textAlign: 'center' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={redeeming ? <CircularProgress size={20} /> : <HowToVoteIcon />}
                                    onClick={handleRedeem}
                                    disabled={redeeming}
                                >
                                    {redeeming ? t('Loading...') : t('Continue to Vote')}
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}
