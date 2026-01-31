import { ReactNode } from 'preact/compat';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { SEO } from './SEO';
import { useTranslation } from 'react-i18next';

interface PageProps {
  title: string;
  description?: string;
  noIndex?: boolean;
  children: ReactNode;
}

export function Page({ title, description, noIndex, children }: PageProps) {
  const { t } = useTranslation();
  return (
    <Container maxWidth="lg">
      <SEO title={`${title} - ${t('App title')}`} description={description} noIndex={noIndex} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {title}
        </Typography>
        <Stack spacing={3}>{children}</Stack>
      </Box>
    </Container>
  );
}
