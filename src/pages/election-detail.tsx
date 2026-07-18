import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '../components/Page';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import DownloadIcon from '@mui/icons-material/Download';
import Tooltip from '@mui/material/Tooltip';

import LZString from 'lz-string';
import * as yaml from 'js-yaml';

import { ElectionChips } from '../components/ElectionChips';
import { ElectionResults } from '../components/ElectionResults';
import { IndividualBallotsList } from '../components/IndividualBallotsList';
import { PairwiseMatrix } from '../components/PairwiseMatrix';
import { ResultsSummary } from '../components/ResultsSummary';
import { CountingLog } from '../components/CountingLog';

import { getElection, getExportUrl, ElectionState, isCopelandResult } from '../data/api';

interface ElectionDetailProps {
  path?: string;
  electionId?: string;
}

export default function ElectionDetail({ electionId }: ElectionDetailProps) {
  const { t } = useTranslation();
  const [electionState, setElectionState] = useState<ElectionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (electionId) {
      loadElection();
    }
  }, [electionId]);

  const pageTitle = electionState
    ? `${electionState.election.title} - ${t('App title')}`
    : `${t('Election Details')} - ${t('App title')}`;
  const pageDescription = electionState?.election.description
    ? `${electionState.election.description.substring(0, 155)}...`
    : 'View election details, candidates, and results for this STV election.';

  const loadElection = async () => {
    if (!electionId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getElection(electionId);
      setElectionState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = () => {
    if (!electionState?.results?.election) return;

    // Use election data directly from results
    const yamlText = yaml.dump(electionState.results.election, { noRefs: true, sortKeys: false });
    const compressed = LZString.compressToEncodedURIComponent(yamlText);

    window.location.href = `/simulate?data=${compressed}`;
  };

  const handleBack = () => {
    window.location.href = '/elections';
  };

  if (loading) {
    return (
      <Page
        title={t('Election Details')}
        description="View election details, candidates, and results for this STV election."
      >
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  if (error) {
    return (
      <Page
        title={t('Election Details')}
        description="View election details, candidates, and results for this STV election."
      >
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          {t('Back to elections')}
        </Button>
        <Alert severity="error">
          {t('Error loading election')}: {error}
        </Alert>
      </Page>
    );
  }

  if (!electionState) {
    return (
      <Page
        title={t('Election Details')}
        description="View election details, candidates, and results for this STV election."
      >
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          {t('Back to elections')}
        </Button>
        <Alert severity="info">{t('Election not found')}</Alert>
      </Page>
    );
  }

  const { election, potential_voters, casted, results } = electionState;
  const start = new Date(election.start_time);
  const end = new Date(election.end_time);
  const now = new Date();
  const votingClosed = now < start || now >= end;
  const votingProgress = potential_voters > 0 ? (casted / potential_voters) * 100 : 0;

  return (
    <Page title={election.title} description={pageDescription}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
        {t('Back to elections')}
      </Button>
      {/* Description */}
      {election.description && (
        <Typography variant="body1" color="text.secondary" paragraph>
          {election.description}
        </Typography>
      )}
      <ElectionChips
        seats={election.seats}
        candidatesCount={election.candidates.length}
        votersCount={potential_voters}
        castedCount={casted}
        startTime={election.start_time}
        endTime={election.end_time}
      />
      {/* Voting Period Info */}
      <Alert severity={votingClosed ? 'info' : 'success'}>
        <Typography variant="body2">
          <strong>{t('Voting Period')}:</strong> {start.toLocaleString()} — {end.toLocaleString()}
          {!votingClosed && ` • ${votingProgress.toFixed(0)}% ${t('turnout')}`}
        </Typography>
      </Alert>
      {/* Export Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Tooltip title={!votingClosed ? t('Export available after voting closes') : ''}>
          <span>
            <Button
              component="a"
              href={votingClosed ? getExportUrl(electionId!) : undefined}
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled={!votingClosed}
            >
              {t('Export Data')}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Results Section - Show first if voting closed */}
      {votingClosed && results && (
        <>
          <ElectionResults
            elected={results.elected}
            electionType={election.election_type}
            onSimulate={handleSimulate}
            showSimulateButton={results.election.ballots.length > 0}
          />
          <ResultsSummary
            log={results.log}
            seats={election.seats}
            numElected={results.elected.length}
          />
        </>
      )}
      {/* Candidates List */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <PeopleIcon /> {t('Candidates')}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {election.candidates.map((candidate, idx) => (
            <Grid
              key={idx}
              size={{
                xs: 12,
                sm: 6,
                md: 4
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <Avatar>{candidate.charAt(0).toUpperCase()}</Avatar>
                <Typography variant="body1">{candidate}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
      {/* Pairwise Comparison Matrix */}
      {votingClosed && results && isCopelandResult(results) && (
        <PairwiseMatrix
          candidates={election.candidates}
          pairwiseMatrix={results.pairwise_matrix}
          order={results.order}
        />
      )}
      <IndividualBallotsList
        electionId={election.id}
        ballots={election.ballots ?? []}
      />
      {/* Election Log (Accordion) - collapsed by default */}
      {results && <CountingLog log={results.log} />}
      {!results && votingClosed && casted === 0 && (
        <Alert severity="info">{t('Election closed without any vote')}</Alert>
      )}
      {!results && !votingClosed && (
        <Alert severity="info">{t('Results will be available after voting is complete')}</Alert>
      )}
    </Page>
  );
}
