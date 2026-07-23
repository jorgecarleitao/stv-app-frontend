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
import Tooltip from '@mui/material/Tooltip';
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
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BalanceIcon from '@mui/icons-material/Balance';
import SchemaIcon from '@mui/icons-material/Schema';
import GppGoodIcon from '@mui/icons-material/GppGood';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Stack from '@mui/material/Stack';

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

const FEATURE_ICONS = [HowToVoteIcon, BalanceIcon, SchemaIcon, GppGoodIcon];

function KeyFeaturesCard() {
  const { t } = useTranslation();
  return (
    <Box sx={{ my: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
        {t('stvMd.keyFeaturesTitle')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {FETURES.map((key, i) => {
          const Icon = FEATURE_ICONS[i];
          return (
            <Paper key={i} elevation={2} sx={{ p: 2.5, textAlign: 'center' }}>
              <Icon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2">{t(key)}</Typography>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

function BallotTable() {
  const { t } = useTranslation();
  const individualBallots = DEFAULT_ELECTION.ballots.flatMap(b =>
    Array.from({ length: b.votes }, () => b.ranks)
  ).sort(() => Math.random() - 0.5);
  return (
    <>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        {t('ballotPreferenceTable')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('ballotExplanation')}
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('ballotNumber')}</TableCell>
              {DEFAULT_ELECTION.candidates.map(c => (
                <Tooltip key={c} title={t('ballotRankTooltip')} arrow placement="top">
                  <TableCell align="center">{c}</TableCell>
                </Tooltip>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {individualBallots.map((ranks, i) => (
              <TableRow key={i}>
                <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>#{i + 1}</TableCell>
                {(ranks ?? []).map((r, ci) => (
                  <TableCell key={ci} align="center">
                    {r !== null ? r + 1 : <Tooltip title={t('ballotNoPreference')} arrow><Box component="span">—</Box></Tooltip>}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
        {individualBallots.length} {t('voters')} {t('ballotTotal')}
      </Typography>
    </>
  );
}

function ExampleSection() {
  const { t } = useTranslation();
  return (
    <Card elevation={3} sx={{ my: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {t('stvMd.exampleTitle')}
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          {t('stvMd.exampleIntro')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 2, mb: 2 }}>
          <Typography variant="body2">
            <strong>{DEFAULT_ELECTION.candidates.length} {t('candidates')}:</strong>{' '}
            {DEFAULT_ELECTION.candidates.join(', ')}
          </Typography>
          <Typography variant="body2">
            <strong>{DEFAULT_ELECTION.seats}</strong> {t('seats')}
          </Typography>
          <Typography variant="body2">
            <strong>{TOTAL_VOTES}</strong> {t('voters')}
          </Typography>
          <Typography variant="body2">
            <strong>{t('Quota')}:</strong> {(TOTAL_VOTES / (DEFAULT_ELECTION.seats + 1)).toFixed(2)} {t('votes')}
          </Typography>
        </Box>
        <BallotTable />
      </CardContent>
    </Card>
  );
}

function OutcomeSection({ loading, error, result }: {
  loading: boolean;
  error: string | null;
  result: any;
}) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!result) return null;
  return (
    <Card elevation={3} sx={{ my: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {t('stvMd.outcomeTitle')}
        </Typography>
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
      </CardContent>
    </Card>
  );
}

function WalkthroughSection({ result }: { result: any }) {
  if (!result) return null;
  return (
    <Box sx={{ my: 3 }}>
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

function TransferRulesSection() {
  const { t } = useTranslation();
  return (
    <Card elevation={3} sx={{ my: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
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

function ActionButtons() {
  const { t } = useTranslation();
  return (
    <Box sx={{ textAlign: 'center', my: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
        <Button variant="contained" size="large" startIcon={<PlayArrowIcon />} href="/simulate" target="_blank" rel="noopener">
          {t('Try Simulator')}
        </Button>
        <Button variant="outlined" size="large" startIcon={<AddIcon />} href="/elections/create">
          {t('Create Election')}
        </Button>
        <Button variant="outlined" size="large" startIcon={<MenuBookIcon />} href="/admin-guide">
          {t('Admin Guide')}
        </Button>
      </Stack>
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
    <Page title={t('STV guide')} description={t('STV Explainer meta description')}>
      <IntroSection />
      <KeyFeaturesCard />
      <ExampleSection />
      <WalkthroughSection result={result} />
      <OutcomeSection loading={loading} error={error} result={result} />
      <TransferRulesSection />
      <ActionButtons />
      <ReferencesCard />
    </Page>
  );
}
