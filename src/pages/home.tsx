import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ScienceIcon from '@mui/icons-material/Science';
import VerifiedIcon from '@mui/icons-material/Verified';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { route } from 'preact-router';

interface HomeProps { path?: string }

export default function Home({ }: HomeProps = {}) {
    const { t } = useTranslation();

    return (
        <Container maxWidth="lg">
            {/* Hero Section */}
            <Box sx={{ textAlign: 'center', my: 6 }}>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {t('STV election runner')}
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4 }}>
                    {t('heroSubtitle')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => route('/elections')}
                        startIcon={<HowToVoteIcon />}
                    >
                        {t('View Elections')}
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => route('/simulate')}
                        startIcon={<ScienceIcon />}
                    >
                        {t('Try Simulator')}
                    </Button>
                </Box>
            </Box>

            {/* Feature Cards */}
            <Grid container spacing={3} sx={{ my: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <HowToVoteIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                                <Typography variant="h5" component="h2">
                                    {t('participateTitle')}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {t('participateDesc')}
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button size="small" onClick={() => route('/elections')}>
                                {t('Go to Elections')}
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <ScienceIcon sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
                                <Typography variant="h5" component="h2">
                                    {t('experimentTitle')}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {t('experimentDesc')}
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button size="small" onClick={() => route('/simulate')}>
                                {t('Try Simulator')}
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <VerifiedIcon sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
                                <Typography variant="h5" component="h2">
                                    {t('transparentTitle')}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {t('transparentDesc')}
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button size="small" onClick={() => route('/elections')}>
                                {t('See Results')}
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{ my: 6 }} />

            {/* What is STV Section */}
            <Paper elevation={2} sx={{ p: 4, my: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUpIcon sx={{ fontSize: 36, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h2">
                        {t('whatIsSTVTitle')}
                    </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                    {t('whatIsSTVPara1')}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t('whatIsSTVPara2')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                    <Button variant="outlined" onClick={() => route('/simulate')}>
                        {t('Try it yourself')}
                    </Button>
                    <Button variant="text" onClick={() => route('/elections')}>
                        {t('View live elections')}
                    </Button>
                </Box>
            </Paper>

            {/* Technical Details Section */}
            <Paper elevation={2} sx={{ p: 4, my: 4 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                    {t('technicalDetailsTitle')}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t('technicalDetailsPara1')}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t('technicalDetailsPara2')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {t('technicalDetailsFooter')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        onClick={() => route('/elections')}
                    >
                        {t('Participate Now')}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => window.open('https://github.com/jorgecarleitao/stv-app', '_blank')}
                    >
                        {t('View Source Code')}
                    </Button>
                </Box>
            </Paper>

            {/* Call to Action */}
            <Box sx={{ textAlign: 'center', my: 6, p: 4, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>
                    {t('readyToStartTitle')}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    {t('readyToStartDesc')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => route('/elections')}
                    >
                        {t('Browse Elections')}
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => route('/simulate')}
                    >
                        {t('Simulate')}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
