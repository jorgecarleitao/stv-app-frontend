import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '../components/Page';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BalanceIcon from '@mui/icons-material/Balance';
import SchemaIcon from '@mui/icons-material/Schema';
import GppGoodIcon from '@mui/icons-material/GppGood';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Stack from '@mui/material/Stack';

import { simulateElection } from '../data/api';
import { Election, ElectionResult, ElectionType, isGroupedResult } from '../data/types';
import { EXAMPLE_ELECTIONS } from '../data/defaults';
import { getSystem, systems } from '../systems';
import { ElectionResults } from '../components/ElectionResults';
import { CountingWalkthrough } from '../components/CountingWalkthrough';

interface Ref {
  url: string;
  labelKey: string;
}

interface SystemSection {
  intro: string[];
  features: string[];
  how: string[];
  exampleIntro: string;
  refs: Ref[];
}

const SECTIONS: Record<ElectionType, SystemSection> = {
  'stv-md': {
    intro: ['stvMd.intro1', 'stvMd.intro2'],
    features: [
      'stvMd.keyFeatureMinWaste',
      'stvMd.keyFeatureMaxProp',
      'stvMd.keyFeatureComplex',
      'stvMd.keyFeatureMinTactical',
    ],
    how: ['stvMd.transferDefeated', 'stvMd.transferElected', 'stvMd.noWasteConclusion'],
    exampleIntro: 'stvMd.exampleIntro',
    refs: [
      {
        url: 'https://gendignoux.com/blog/2023/03/27/single-transferable-vote.html',
        labelKey: 'stvMd.refGendignoux',
      },
      {
        url: "https://en.wikipedia.org/wiki/Single_transferable_vote#Meek's_method",
        labelKey: 'stvMd.refMeek',
      },
      { url: 'https://en.wikipedia.org/wiki/Droop_quota', labelKey: 'stvMd.refDroop' },
      { url: 'https://www.youtube.com/watch?v=fZauud9CdcU', labelKey: 'stvMd.refUNSW' },
      {
        url: 'https://www.youtube.com/watch?v=P38Y4VG1Ibo',
        labelKey: 'stvMd.refElectoralCommission',
      },
    ],
  },
  'stv-md-coperland': {
    intro: ['sys.stv-md-coperland.intro1'],
    features: [
      'sys.stv-md-coperland.feature1',
      'sys.stv-md-coperland.feature2',
      'sys.stv-md-coperland.feature3',
    ],
    how: ['sys.stv-md-coperland.how1', 'sys.stv-md-coperland.how2'],
    exampleIntro: 'sys.stv-md-coperland.exampleIntro',
    refs: [
      {
        url: 'https://en.wikipedia.org/wiki/Copeland%27s_method',
        labelKey: 'sys.stv-md-coperland.refCopeland',
      },
    ],
  },
  'stv-md-grouped': {
    intro: ['sys.stv-md-grouped.intro1', 'sys.stv-md-grouped.intro2'],
    features: [
      'sys.stv-md-grouped.feature1',
      'sys.stv-md-grouped.feature2',
      'sys.stv-md-grouped.feature3',
    ],
    how: ['sys.stv-md-grouped.how1', 'sys.stv-md-grouped.how2'],
    exampleIntro: 'sys.stv-md-grouped.exampleIntro',
    refs: [
      {
        url: 'https://en.wikipedia.org/wiki/Single_transferable_vote',
        labelKey: 'sys.stv-md-grouped.refStv',
      },
    ],
  },
  schulze: {
    intro: ['sys.schulze.intro1', 'sys.schulze.intro2'],
    features: ['sys.schulze.feature1', 'sys.schulze.feature2', 'sys.schulze.feature3'],
    how: ['sys.schulze.how1', 'sys.schulze.how2'],
    exampleIntro: 'sys.schulze.exampleIntro',
    refs: [
      {
        url: 'https://en.wikipedia.org/wiki/Schulze_method',
        labelKey: 'sys.schulze.refSchulze',
      },
      {
        url: 'https://en.wikipedia.org/wiki/Condorcet_method',
        labelKey: 'sys.schulze.refCondorcet',
      },
    ],
  },
};

const FEATURE_ICONS = [HowToVoteIcon, BalanceIcon, SchemaIcon, GppGoodIcon];

interface Props {
  path?: string;
}

function BallotTable({ example }: { example: Election }) {
  const { t } = useTranslation();
  const individualBallots = example.ballots
    .flatMap(b => Array.from({ length: b.votes }, () => b.ranks))
    .sort(() => Math.random() - 0.5);
  return (
    <>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        {t('ballotPreferenceTable')}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t('ballotExplanation')}
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('ballotNumber')}</TableCell>
              {example.candidates.map(c => (
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
                    {r !== null ? (
                      r + 1
                    ) : (
                      <Tooltip title={t('ballotNoPreference')} arrow>
                        <Box component="span">—</Box>
                      </Tooltip>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: 'block', textAlign: 'right' }}
      >
        {individualBallots.length} {t('voters')} {t('ballotTotal')}
      </Typography>
    </>
  );
}

function SystemSection({ systemId }: { systemId: ElectionType }) {
  const { t } = useTranslation();
  const example = EXAMPLE_ELECTIONS[systemId];
  const section = SECTIONS[systemId];
  const system = getSystem(systemId);
  const [result, setResult] = useState<ElectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setResult(null);
    simulateElection(example)
      .then(setResult)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemId]);

  const totalVotes = example.ballots.reduce((sum, b) => sum + b.votes, 0);
  const showQuota = systemId === 'stv-md' || systemId === 'stv-md-coperland';
  const SystemResultSections = system.ResultSections;

  return (
    <Box sx={{ mt: 3 }}>
      {section.intro.map((key, i) => (
        <Typography key={i} variant="body1" gutterBottom>
          {t(key)}
        </Typography>
      ))}

      <Box sx={{ my: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          {t('stvMd.keyFeaturesTitle')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: `repeat(${section.features.length}, 1fr)`,
            },
            gap: 2,
          }}
        >
          {section.features.map((key, i) => {
            const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
            return (
              <Paper key={key} elevation={2} sx={{ p: 2.5, textAlign: 'center' }}>
                <Icon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2">{t(key)}</Typography>
              </Paper>
            );
          })}
        </Box>
      </Box>

      <Card elevation={3} sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t('stvMd.exampleTitle')}
          </Typography>
          <Typography variant="body1" gutterBottom color="text.secondary">
            {t(section.exampleIntro)}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 2, mb: 2 }}>
            <Typography variant="body2">
              <strong>
                {example.candidates.length} {t('candidates')}:
              </strong>{' '}
              {example.candidates.join(', ')}
            </Typography>
            <Typography variant="body2">
              <strong>{example.seats}</strong> {t('seats')}
            </Typography>
            <Typography variant="body2">
              <strong>{totalVotes}</strong> {t('voters')}
            </Typography>
            {showQuota && (
              <Typography variant="body2">
                <strong>{t('Quota')}:</strong> {(totalVotes / (example.seats + 1)).toFixed(2)}{' '}
                {t('votes')}
              </Typography>
            )}
          </Box>
          <BallotTable example={example} />
        </CardContent>
      </Card>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {result && (
        <>
          <Box sx={{ my: 3 }}>
            {isGroupedResult(result) ? (
              result.group_results.map((gr: any) => (
                <CountingWalkthrough key={gr.group} log={gr.log} />
              ))
            ) : (
              <CountingWalkthrough log={result.log} />
            )}
          </Box>
          <Card elevation={3} sx={{ my: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {t('stvMd.outcomeTitle')}
              </Typography>
              <ElectionResults result={result} electionType={systemId} />
              <SystemResultSections
                result={result}
                candidates={example.candidates}
                seats={example.seats}
              />
            </CardContent>
          </Card>
        </>
      )}

      <Card elevation={3} sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t('sys.howItCounts')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {section.how.map((key, i) => (
              <Paper key={i} elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2">{t(key)}</Typography>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card elevation={3} sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t('stvMd.referencesTitle')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
            {section.refs.map((ref, i) => (
              <Paper
                key={i}
                elevation={1}
                sx={{ p: 2, borderLeft: 3, borderColor: 'secondary.main' }}
              >
                <Link
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {t(ref.labelKey)}
                </Link>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'center' }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            href="/simulate"
            target="_blank"
            rel="noopener"
          >
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
    </Box>
  );
}

export default function SystemsPage({ path }: Props = {}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ElectionType>('stv-md');

  return (
    <Page title={t('Voting systems')} description={t('Systems meta description')}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v as ElectionType)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {Object.values(systems).map(s => (
          <Tab key={s.id} value={s.id} label={t(s.label)} />
        ))}
      </Tabs>
      <SystemSection key={tab} systemId={tab} />
    </Page>
  );
}
