import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '../components/Page';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { simulateElection, isGroupedResult } from '../data/api';
import { DEFAULT_ELECTION } from '../data/defaults';
import { ElectionResults } from '../components/ElectionResults';
import { CountingWalkthrough } from '../components/CountingWalkthrough';
import { ResultsSummary } from '../components/ResultsSummary';

const REFS = [
  { url: 'https://gendignoux.com/blog/2023/03/27/single-transferable-vote.html', labelKey: 'stvMd.refGendignoux' },
  { url: "https://en.wikipedia.org/wiki/Single_transferable_vote#Meek's_method", labelKey: 'stvMd.refMeek' },
  { url: 'https://en.wikipedia.org/wiki/Droop_quota', labelKey: 'stvMd.refDroop' },
  { url: 'https://www.youtube.com/watch?v=fZauud9CdcU', labelKey: 'stvMd.refUNSW' },
  { url: 'https://www.youtube.com/watch?v=P38Y4VG1Ibo', labelKey: 'stvMd.refElectoralCommission' },
];

const FETURES = ['stvMd.keyFeatureMinWaste', 'stvMd.keyFeatureMaxProp', 'stvMd.keyFeatureComplex', 'stvMd.keyFeatureMinTactical'];
const INPUTS = ['stvMd.inputCandidates', 'stvMd.inputSeats', 'stvMd.inputVotes'];
const TRANSFER_RULES = ['stvMd.transferDefeated', 'stvMd.transferElected'];
const NO_WASTE_CASES = ['stvMd.noWasteCaseMajority', 'stvMd.noWasteCaseMinority'];

const TOTAL_VOTES = DEFAULT_ELECTION.ballots.reduce((sum, b) => sum + b.votes, 0);

interface Props {
  path?: string;
}

function IntroSection() {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="body1" paragraph>
        {t('stvMd.intro1')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('stvMd.intro2')}
      </Typography>
    </>
  );
}

function KeyFeaturesCard() {
  const { t } = useTranslation();
  return (
    <Paper elevation={2} sx={{ p: 3, my: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
      <Typography variant="h6" gutterBottom>
        {t('stvMd.keyFeaturesTitle')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {FETURES.map((key, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={i + 1} size="small" sx={{ minWidth: 32 }} />
            <Typography variant="body2">{t(key)}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function BallotTable() {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        {t('Ballot groups')}
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('votes')}</TableCell>
              {DEFAULT_ELECTION.candidates.map(c => (
                <TableCell key={c} align="center">{c}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {DEFAULT_ELECTION.ballots.map((b, i) => (
              <TableRow key={i}>
                <TableCell sx={{ fontWeight: 'bold' }}>{b.votes}</TableCell>
                {(b.ranks ?? []).map((r, ci) => (
                  <TableCell key={ci} align="center">
                    {r !== null ? r + 1 : '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

function InputsCard() {
  const { t } = useTranslation();
  return (
    <Card elevation={3} sx={{ my: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {t('stvMd.inputsTitle')}
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          {t('stvMd.inputsIntro')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {INPUTS.map((key, i) => (
            <Paper key={i} elevation={1} sx={{ p: 2, borderLeft: 3, borderColor: 'primary.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={i + 1} color="primary" size="small" />
                <Typography variant="body2">{t(key)}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
        <Typography variant="body1" paragraph color="text.secondary" sx={{ mt: 3 }}>
          {t('stvMd.inputsExampleDescription')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 2 }}>
          <Typography variant="body2">
            <strong>{DEFAULT_ELECTION.candidates.length} {t('candidates')}:</strong>{' '}
            {DEFAULT_ELECTION.candidates.join(', ')}
          </Typography>
          <Typography variant="body2">
            <strong>{DEFAULT_ELECTION.seats}</strong> {t('seats')}
          </Typography>
          <Typography variant="body2">
            <strong>{TOTAL_VOTES}</strong> {t('voters')}, <strong>{DEFAULT_ELECTION.ballots.length}</strong> {t('unique patterns')}
          </Typography>
        </Box>
        <BallotTable />
      </CardContent>
    </Card>
  );
}

function LiveExampleSection({ loading, error, result }: {
  loading: boolean;
  error: string | null;
  result: any;
}) {
  const { t } = useTranslation();
  return (
    <Paper elevation={2} sx={{ p: 3, my: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
      <Typography variant="h5" gutterBottom>
        {t('stvMd.liveExampleTitle')}
      </Typography>
      <Typography variant="body2" paragraph>
        {t('stvMd.liveExampleDescription')}
      </Typography>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {result && (
        <>
          <ElectionResults
            elected={result.elected}
            electionType={DEFAULT_ELECTION.election_type}
            groups={isGroupedResult(result) ? result.groups : undefined}
            groupResults={isGroupedResult(result) ? result.group_results : undefined}
          />
          {isGroupedResult(result) ? (
            result.group_results.map((gr: any) => (
              <ResultsSummary key={gr.group} log={gr.log} seats={gr.seats} numElected={gr.elected.length} groupName={gr.group} />
            ))
          ) : (
            <ResultsSummary log={result.log} seats={DEFAULT_ELECTION.seats} numElected={result.elected.length} />
          )}
        </>
      )}
    </Paper>
  );
}

function HowItWorksCard() {
  const { t } = useTranslation();
  return (
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
          {TRANSFER_RULES.map((key, i) => (
            <Paper key={i} elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body2">{t(key)}</Typography>
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
          {NO_WASTE_CASES.map((key, i) => (
            <Paper key={i} elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body2">{t(key)}</Typography>
            </Paper>
          ))}
        </Box>
        <Typography variant="body2" paragraph color="text.secondary" sx={{ mt: 2 }}>
          {t('stvMd.noWasteConclusion')}
        </Typography>
      </CardContent>
    </Card>
  );
}

function WalkthroughSection({ result }: { result: any }) {
  if (!result) return null;
  const { t } = useTranslation();
  return (
    <Box>
      {isGroupedResult(result) ? (
        result.group_results.map((gr: any) => (
          <CountingWalkthrough key={gr.group} log={gr.log} />
        ))
      ) : (
        <CountingWalkthrough log={result.log} />
      )}
    </Box>
  );
}

function TrySimulatorButton() {
  const { t } = useTranslation();
  return (
    <Box sx={{ textAlign: 'center', my: 4 }}>
      <Button variant="contained" size="large" endIcon={<OpenInNewIcon />} href="/simulate">
        {t('Try Simulator')}
      </Button>
    </Box>
  );
}

function ReferencesCard() {
  const { t } = useTranslation();
  return (
    <Card elevation={3} sx={{ my: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {t('stvMd.referencesTitle')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
          {REFS.map((ref, i) => (
            <Paper key={i} elevation={1} sx={{ p: 2, borderLeft: 3, borderColor: 'secondary.main' }}>
              <Link href={ref.url} target="_blank" rel="noopener noreferrer"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                {t(ref.labelKey)}
              </Link>
            </Paper>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function StvExplainer({ path }: Props = {}) {
  const { t } = useTranslation();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    simulateElection(DEFAULT_ELECTION)
      .then(setResult)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page title={`${t('STV guide')} - ${t('App title')}`} description={t('STV Explainer meta description')}>
      <IntroSection />
      <KeyFeaturesCard />
      <InputsCard />
      <LiveExampleSection loading={loading} error={error} result={result} />
      <HowItWorksCard />
      <WalkthroughSection result={result} />
      <TrySimulatorButton />
      <ReferencesCard />
    </Page>
  );
}
