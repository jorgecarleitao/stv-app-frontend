import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '../components/Page';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import LZString from 'lz-string';
import * as yaml from 'js-yaml';

import { Election, ElectionResult, Elected, simulateElection, Ballot } from '../data/api';
import { BallotsEditor } from '../ballot';
import { ElectionResults } from '../components/ElectionResults';
import { PairwiseMatrix } from '../components/PairwiseMatrix';
import { ResultsBallotGroups } from '../components/ResultsBallotGroups';
import { CountingLog } from '../components/CountingLog';
import { ElectionSeatsConfig } from '../components/ElectionSeatsConfig';
import { CandidatesList } from '../components/CandidatesList';

// Convert UI ranks (1-based) to API ranks (0-based)
function toApiRanks(ranks: (number | null)[]): (number | null)[] {
  return ranks.map(r => (r === null ? null : r - 1));
}

// Convert API ranks (0-based) to UI ranks (1-based)
function fromApiRanks(ranks: (number | null)[]): (number | null)[] {
  return ranks.map(r => (r === null ? null : r + 1));
}

const defaultElection: Election = {
  candidates: ['Ana', 'Rodrigo', 'Sara', 'Tiago'],
  seats: 3,
  ordered_seats: true,
  ballots: [
    {
      votes: 10,
      ranks: [2, 1, null, 0], // 0-based ranks (API format)
    },
    {
      votes: 5,
      ranks: [3, 1, 0, 2], // 0-based ranks (API format)
    },
  ],
};

const HEADER = 'h5';

interface SimulateProps {
  path?: string;
}

export default function Simulate({ path }: SimulateProps = {}) {
  const { t } = useTranslation();

  const pageTitle = `${t('Simulate')} - ${t('App title')}`;
  const metaDescription = t('Simulate meta description');

  const [election, setElection] = useState<Election>(defaultElection);
  const [yamlText, setYamlText] = useState('');
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [result, setResult] = useState<ElectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingYaml, setPendingYaml] = useState(''); // used for debounce

  // Track if we've loaded from URL to avoid overwriting it
  const initializedFromUrl = useRef(false);

  // Load from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('data');
    if (encoded) {
      try {
        const yamlText = LZString.decompressFromEncodedURIComponent(encoded);
        if (yamlText) {
          const loaded = yaml.load(yamlText) as Election;
          setElection(loaded);
          setYamlText(yamlText);
          setPendingYaml(yamlText);
          setYamlError(null);
        }
      } catch (e) {
        console.error('Failed to load data from URL:', e);
      }
    }
    // Mark as initialized after checking URL (whether we loaded from it or not)
    initializedFromUrl.current = true;
  }, []);

  // Sync election to URL (but only after initial load from URL)
  useEffect(() => {
    if (initializedFromUrl.current) {
      const yamlText = yaml.dump(election, { noRefs: true, sortKeys: false });
      const compressed = LZString.compressToEncodedURIComponent(yamlText);

      const params = new URLSearchParams(window.location.search);
      params.set('data', compressed);

      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }
  }, [election]);

  // Update YAML text when election changes (but not on initial URL load to avoid overwriting)
  useEffect(() => {
    if (initializedFromUrl.current) {
      const newYaml = yaml.dump(election, { noRefs: true, sortKeys: false });
      setYamlText(newYaml);
      setPendingYaml(newYaml);
      setYamlError(null);
      setResult(null);
      setError(null);
    }
  }, [election]);

  // Debounce: update yamlText to pendingYaml after user stops typing for 400ms
  useEffect(() => {
    const handler = setTimeout(() => handleYamlChange(pendingYaml), 400);
    return () => clearTimeout(handler);
  }, [pendingYaml]); // Only run when pendingYaml changes

  const handleRunElection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await simulateElection(election);
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = () => {
    setElection(e => ({
      ...e,
      candidates: [...e.candidates, `${t('Candidate')} ${e.candidates.length + 1}`],
      ballots: e.ballots.map(b => ({
        ...b,
        ranks: [...b.ranks, null],
      })),
    }));
  };

  const handleRemoveCandidate = (idx: number) => {
    setElection(e => ({
      ...e,
      candidates: e.candidates.filter((_, i) => i !== idx),
      ballots: e.ballots.map(b => ({
        ...b,
        ranks: b.ranks.filter((_, i) => i !== idx),
      })),
    }));
  };

  const handleRenameCandidate = (idx: number, value: string) => {
    setElection(e => {
      const newCands = [...e.candidates];
      newCands[idx] = value;
      return { ...e, candidates: newCands };
    });
  };

  const handleAddBallot = () => {
    setElection(e => ({
      ...e,
      ballots: [
        ...e.ballots,
        {
          votes: 1,
          ranks: Array(e.candidates.length).fill(null),
        },
      ],
    }));
  };

  const handleRemoveBallot = (ballotIdx: number) => {
    setElection(e => ({
      ...e,
      ballots: e.ballots.filter((_, i) => i !== ballotIdx),
    }));
  };

  const handleChangeBallotVotes = (ballotIdx: number, votes: number) => {
    setElection(e => ({
      ...e,
      ballots: e.ballots.map((b, i) => (i === ballotIdx ? { ...b, votes } : b)),
    }));
  };

  const handleChangeBallotRank = (ballotIdx: number, candIdx: number, rank: number | null) => {
    setElection(e => ({
      ...e,
      ballots: e.ballots.map((b, i) =>
        i === ballotIdx
          ? {
              ...b,
              ranks: b.ranks.map((r, cIdx) => (cIdx === candIdx ? rank : r)),
            }
          : b
      ),
    }));
  };

  const handleYamlChange = (val: string) => {
    if (val == '') {
      return;
    }
    setYamlText(val);
    try {
      const loaded = yaml.load(val);
      if (
        typeof loaded !== 'object' ||
        !loaded ||
        !('candidates' in loaded) ||
        !('seats' in loaded || 'seats' in loaded) ||
        !('ballots' in loaded)
      ) {
        setYamlError('YAML is parsed but not recognized as an election structure.');
        return;
      }
      setElection(loaded);
      setYamlError(null);
    } catch (err: any) {
      setYamlError('YAML parse error: ' + err.message);
    }
  };

  return (
    <Page title={t('Simulate')} description={metaDescription}>
      <Paper elevation={4} sx={{ p: 3 }}>
        <Typography variant={HEADER} gutterBottom>
          {t('Number of seats to elect')}
        </Typography>
        <ElectionSeatsConfig
          numSeats={election.seats}
          orderedSeats={election.ordered_seats}
          maxSeats={election.candidates.length}
          onNumSeatsChange={val => setElection(el => ({ ...el, seats: val }))}
          onOrderedSeatsChange={val => setElection(el => ({ ...el, ordered_seats: val }))}
        />
      </Paper>

      <Paper elevation={4} sx={{ p: 3 }}>
        <Typography variant={HEADER} gutterBottom>
          {t('Candidates')}
        </Typography>
        <CandidatesList
          candidates={election.candidates}
          onCandidateChange={handleRenameCandidate}
          onAddCandidate={handleAddCandidate}
          onRemoveCandidate={handleRemoveCandidate}
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant={HEADER} gutterBottom sx={{ mb: 0 }}>
            {t('Ballot groups')}
          </Typography>
          <Tooltip arrow placement="right" title={t('editBallotsInstructions')}>
            <IconButton size="small">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <BallotsEditor
          candidates={election.candidates}
          ballots={election.ballots.map(b => ({ ...b, ranks: fromApiRanks(b.ranks) }))}
          onChangeBallotVotes={handleChangeBallotVotes}
          onChangeBallotRank={(ballotIdx, candIdx, rank) => {
            // Convert 1-based UI rank to 0-based API rank
            const apiRank = rank === null ? null : rank - 1;
            handleChangeBallotRank(ballotIdx, candIdx, apiRank);
          }}
          onAddBallot={handleAddBallot}
          onRemoveBallot={handleRemoveBallot}
        />
      </Paper>

      <Button
        fullWidth
        variant="contained"
        color="success"
        onClick={handleRunElection}
        disabled={loading}
      >
        {loading ? t('Running...') : t('Run Election')}
      </Button>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Results Section */}
      {result && <ElectionResults elected={result.elected} orderedSeats={election.ordered_seats} />}

      {/* Pairwise Comparison Matrix */}
      {result && result.pairwise_matrix && result.order && election.ordered_seats && (
        <PairwiseMatrix
          candidates={result.election.candidates}
          pairwiseMatrix={result.pairwise_matrix}
          order={result.order}
        />
      )}

      {/* Ballot Groups */}
      {result && result.election.ballots.length > 0 && (
        <ResultsBallotGroups
          candidates={result.election.candidates}
          ballots={result.election.ballots.map(b => ({ ...b, ranks: fromApiRanks(b.ranks) }))}
        />
      )}

      {/* Detailed Counting Log */}
      {result && <CountingLog log={result.log} />}

      <Paper elevation={4} sx={{ p: 2 }}>
        <Typography variant={HEADER} gutterBottom>
          {t('Load/Save election')}
        </Typography>
        <TextField
          label="YAML"
          multiline
          minRows={8}
          maxRows={20}
          fullWidth
          value={pendingYaml}
          onChange={(e: any) => setPendingYaml(e.target.value)}
          placeholder={t('Edit election YAML here...')}
          error={!!yamlError}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={t('loadSaveYamlInstructions')} placement="top" arrow>
                  <IconButton tabIndex={-1}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
        {yamlError && <Alert severity="error">{yamlError}</Alert>}
      </Paper>
    </Page>
  );
}
