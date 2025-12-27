import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Markdown from 'preact-markdown';
import { route } from 'preact-router';

interface HomeProps { path?: string }

export default function Home({ }: HomeProps = {}) {
    const { t } = useTranslation();
    return (
        <Container>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {t('Introduction')}
                </Typography>
                <Typography component="div" variant="body1">
                    <Markdown markdown={t('methodology')} />
                </Typography>
            </Paper>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={() => route('/elections')}>{t('Elections')}</Button>
                <Button variant="outlined" onClick={() => route('/simulate')}>Simulate</Button>
            </Box>
        </Container>
    );
}
