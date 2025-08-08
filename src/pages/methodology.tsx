import { useTranslation } from 'react-i18next';

import Markdown from 'preact-markdown';

import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';

export default function Home() {
    const { t, i18n } = useTranslation();
    return <Container>
        <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
            <Typography component="div">
                <Markdown markdown={t('methodology')} />
            </Typography>
        </Paper>
    </Container>
}
