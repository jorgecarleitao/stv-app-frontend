import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';

interface Props {
  path?: string;
}

export default function StvExplainer({ path }: Props = {}) {
  const { t } = useTranslation();

  const pageTitle = `${t('STV guide')} - ${t('App title')}`;
  const metaDescription = t('STV Explainer meta description');

  const keyFeatures = [
    t('stvMd.keyFeatureMinWaste'),
    t('stvMd.keyFeatureMaxProp'),
    t('stvMd.keyFeatureComplex'),
    t('stvMd.keyFeatureMinTactical'),
  ];

  const inputs = [t('stvMd.inputCandidates'), t('stvMd.inputSeats'), t('stvMd.inputVotes')];

  const transferRules = [t('stvMd.transferDefeated'), t('stvMd.transferElected')];

  const noWasteCases = [t('stvMd.noWasteCaseMajority'), t('stvMd.noWasteCaseMinority')];

  const references = [
    {
      url: 'https://gendignoux.com/blog/2023/03/27/single-transferable-vote.html',
      label: t('stvMd.refGendignoux'),
    },
    {
      url: "https://en.wikipedia.org/wiki/Single_transferable_vote#Meek's_method",
      label: t('stvMd.refMeek'),
    },
    { url: 'https://en.wikipedia.org/wiki/Droop_quota', label: t('stvMd.refDroop') },
    { url: 'https://www.youtube.com/watch?v=fZauud9CdcU', label: t('stvMd.refUNSW') },
    {
      url: 'https://www.youtube.com/watch?v=P38Y4VG1Ibo',
      label: t('stvMd.refElectoralCommission'),
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <SEO title={pageTitle} description={metaDescription} />
      <Typography variant="h4" component="h1" gutterBottom>
        {t('STV guide')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('stvMd.intro1')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('stvMd.intro2')}
      </Typography>

      {/* Key features */}
      <Paper
        elevation={2}
        sx={{ p: 3, my: 3, bgcolor: 'success.light', color: 'success.contrastText' }}
      >
        <Typography variant="h6" gutterBottom>
          {t('stvMd.keyFeaturesTitle')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {keyFeatures.map((feature, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={index + 1} size="small" sx={{ minWidth: 32 }} />
              <Typography variant="body2">{feature}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Inputs */}
      <Card elevation={3} sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t('stvMd.inputsTitle')}
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            {t('stvMd.inputsIntro')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {inputs.map((input, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{ p: 2, borderLeft: 3, borderColor: 'primary.main' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={index + 1} color="primary" size="small" />
                  <Typography variant="body2">{input}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Example */}
      <Paper elevation={2} sx={{ p: 3, my: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          {t('stvMd.exampleTitle')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
          <Typography variant="body2">
            <strong>{t('stvMd.exampleCandidates')}</strong>
          </Typography>
          <Typography variant="body2">
            <strong>{t('stvMd.exampleSeats')}</strong>
          </Typography>
          <Typography variant="body2">
            <strong>{t('stvMd.exampleVotesTitle')}</strong>
          </Typography>
          <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2">• {t('stvMd.exampleVote1')}</Typography>
            <Typography variant="body2">• {t('stvMd.exampleVote2')}</Typography>
            <Typography variant="body2">• {t('stvMd.exampleVote3')}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Iterative method */}
      <Card elevation={3} sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t('stvMd.iterationsTitle')}
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            {t('stvMd.iterationsIntro1')}
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            {t('stvMd.iterationsIntro2')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('stvMd.transferRulesTitle')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {transferRules.map((rule, index) => (
              <Paper key={index} elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2">{rule}</Typography>
              </Paper>
            ))}
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('stvMd.noWasteTitle')}
          </Typography>
          <Typography variant="body2" paragraph color="text.secondary">
            {t('stvMd.noWasteIntro')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {noWasteCases.map((wasteCase, index) => (
              <Paper key={index} elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2">{wasteCase}</Typography>
              </Paper>
            ))}
          </Box>
          <Typography variant="body2" paragraph color="text.secondary" sx={{ mt: 2 }}>
            {t('stvMd.noWasteConclusion')}
          </Typography>
        </CardContent>
      </Card>

      {/* References */}
      <Card elevation={3} sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t('stvMd.referencesTitle')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
            {references.map((ref, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{ p: 2, borderLeft: 3, borderColor: 'secondary.main' }}
              >
                <Link
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {ref.label}
                </Link>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
