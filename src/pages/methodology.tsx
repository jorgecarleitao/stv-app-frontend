import { useTranslation } from 'react-i18next';

import Markdown from 'preact-markdown';

import Typography from '@mui/material/Typography';

export default function Home() {
    const { t, i18n } = useTranslation();
    return <Typography component="div">
        <Markdown markdown={t('methodology')} />
    </Typography>
}
