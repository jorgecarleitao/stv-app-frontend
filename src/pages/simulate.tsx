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
import CircularProgress from '@mui/material/CircularProgress';

import LZString from 'lz-string';
import * as yaml from 'js-yaml';

import { Election, ElectionResult, simulateElection, ElectionType, isCopelandResult, isGroupedResult, GroupConfig } from '../data/api';
import { BallotsEditor } from '../ballot';
import { ElectionResults } from '../components/ElectionResults';
import { PairwiseMatrix } from '../components/PairwiseMatrix';
import { CountingLog } from '../components/CountingLog';
import { ElectionSeatsConfig } from '../components/ElectionSeatsConfig';
import { CandidatesList } from '../components/CandidatesList';
import { GroupConfigList } from '../components/GroupConfigList';
import { ResultsSummary } from '../components/ResultsSummary';

// Convert UI ranks (1-based) to API ranks (0-based)
function toApiRanks(ranks: (number | null)[]): (number | null)[] {
  return ranks.map(r => (r === null ? null : r - 1));
}

// Convert API ranks (0-based) to UI ranks (1-based)
function fromApiRanks(ranks: (number | null)[]): (number | null)[] {
  return ranks.map(r => (r === null ? null : r + 1));
}

const defaultElection: Election = {
  candidates: ['Elena', 'Marco', 'Lucia', 'André', 'Sofia'],
  seats: 3,
  election_type: 'stv-md',
  ballots: [
    {
      votes: 11,
      ranks: [0, 3, 4, 1, 2],
    },
    {
      votes: 4,
      ranks: [0, 3, 4, 2, 1],
    },
    {
      votes: 9,
      ranks: [2, 0, 1, 3, 4],
    },
    {
      votes: 8,
      ranks: [2, 3, 0, 1, 4],
    },
    {
      votes: 4,
      ranks: [4, 3, 2, 1, 0],
    },
    {
      votes: 3,
      ranks: [3, 4, 2, 0, 1],
    },
  ],
  groups: [],
  candidate_groups: [],
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
          setElection({ ...loaded, election_type: (loaded.election_type ?? 'stv-md') as ElectionType } as Election);
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
        ranks: [...(b.ranks ?? []), null],
      })),
    }));
  };

  const handleRemoveCandidate = (idx: number) => {
    setElection(e => ({
      ...e,
      candidates: e.candidates.filter((_, i) => i !== idx),
      ballots: e.ballots.map(b => ({
        ...b,
        ranks: (b.ranks ?? []).filter((_, i) => i !== idx),
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

  const handleCandidateGroupChange = (idx: number, group: string) => {
    setElection(e => {
      const newGroups = [...(e.candidate_groups ?? [])];
      newGroups[idx] = group;
      return { ...e, candidate_groups: newGroups };
    });
  };

  const handleGroupsChange = (groups: GroupConfig[]) => {
    setElection(e => ({ ...e, groups }));
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
            ranks: (b.ranks ?? []).map((r, cIdx) => (cIdx === candIdx ? rank : r)),
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
      setElection({ ...loaded, election_type: ((loaded as any).election_type ?? 'stv-md') as ElectionType } as Election);
      setYamlError(null);
    } catch (err: any) {
      setYamlError('YAML parse error: ' + err.message);
    }
  };

  const canRun = election.candidates.length >= 2 && election.seats > 0 && election.ballots.length > 0;
  const totalVotes = election.ballots.reduce((sum, b) => sum + b.votes, 0);

  return (
    <Page title={t('Simulate')} description={metaDescription}>
      {/* YAML: collapsed by default at top */}
      <Accordion elevation={4} defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">{t('Load/Save election')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
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
        </AccordionDetails>
      </Accordion>

      <Paper elevation={4} sx={{ p: 3 }}>
        <Typography variant={HEADER} gutterBottom>
          {t('Number of seats to elect')}
        </Typography>
        <ElectionSeatsConfig
          numSeats={election.seats}
          electionType={election.election_type}
          maxSeats={election.candidates.length}
          onNumSeatsChange={val => setElection(el => ({ ...el, seats: val }))}
          onElectionTypeChange={val => {
            setElection(el => {
              const isGrouped = val === 'stv-md-grouped';
              return {
                ...el,
                election_type: val,
                groups: isGrouped && el.groups?.length === 0
                  ? [{ name: 'Group A', seats: 1 }, { name: 'Group B', seats: 1 }]
                  : el.groups ?? [],
                candidate_groups: isGrouped && el.candidate_groups?.length === 0
                  ? el.candidates.map(() => '')
                  : el.candidate_groups ?? [],
              };
            });
          }}
        />
      </Paper>

      {election.election_type === 'stv-md-grouped' && (
        <Paper elevation={4} sx={{ p: 3 }}>
          <Typography variant={HEADER} gutterBottom>
            {t('Groups')}
          </Typography>
          <GroupConfigList
            groups={election.groups ?? []}
            onGroupsChange={handleGroupsChange}
          />
        </Paper>
      )}

      <Paper elevation={4} sx={{ p: 3 }}>
        <Typography variant={HEADER} gutterBottom>
          {t('Candidates')}
        </Typography>
        <CandidatesList
          candidates={election.candidates}
          electionType={election.election_type}
          groups={election.election_type === 'stv-md-grouped' ? election.groups : undefined}
          candidateGroups={election.candidate_groups}
          onCandidateChange={handleRenameCandidate}
          onCandidateGroupChange={election.election_type === 'stv-md-grouped' ? handleCandidateGroupChange : undefined}
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
        {election.ballots.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No ballot groups yet. Add one to define voting patterns.
            </Typography>
            <Button variant="outlined" onClick={handleAddBallot} sx={{ mt: 1 }}>
              {t('Add Ballot group')}
            </Button>
          </Paper>
        ) : (
          <BallotsEditor
            candidates={election.candidates}
            ballots={election.ballots.map(b => ({ ...b, ranks: fromApiRanks(b.ranks ?? []) }))}
            onChangeBallotVotes={handleChangeBallotVotes}
            onChangeBallotRank={(ballotIdx, candIdx, rank) => {
              const apiRank = rank === null ? null : rank - 1;
              handleChangeBallotRank(ballotIdx, candIdx, apiRank);
            }}
            onAddBallot={handleAddBallot}
            onRemoveBallot={handleRemoveBallot}
          />
        )}
      </Paper>

      <Tooltip
        title={
          !canRun
            ? `Need at least 2 candidates, 1 seat, and 1 ballot group`
            : ''
        }
      >
        <span>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={handleRunElection}
            disabled={loading || !canRun}
          >
            {loading ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1, color: 'inherit' }} />
                {t('Running...')}
              </>
            ) : (
              t('Run Election')
            )}
          </Button>
        </span>
      </Tooltip>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Results */}
      {result && (
        <ElectionResults
          elected={result.elected}
          electionType={election.election_type}
          groups={isGroupedResult(result) ? result.groups : undefined}
          groupResults={isGroupedResult(result) ? result.group_results : undefined}
        />
      )}

      {/* Results Summary */}
      {result && isGroupedResult(result) ? (
        result.group_results.map((gr) => (
          <ResultsSummary
            key={gr.group}
            log={gr.log}
            seats={gr.seats}
            numElected={gr.elected.length}
            groupName={gr.group}
          />
        ))
      ) : result ? (
        <ResultsSummary
          log={result.log}
          seats={election.seats}
          numElected={result.elected.length}
        />
      ) : null}

      {/* Pairwise Comparison Matrix */}
      {result && isCopelandResult(result) && (
        <PairwiseMatrix
          candidates={result.election.candidates}
          pairwiseMatrix={result.pairwise_matrix}
          order={result.order}
        />
      )}

      {/* Detailed Counting Log (per group for grouped results) */}
      {result && isGroupedResult(result) ? (
        result.group_results.map((gr) => (
          <CountingLog key={gr.group} log={gr.log} groupName={gr.group} />
        ))
      ) : result ? (
        <CountingLog log={result.log} />
      ) : null}
    </Page>
  );
}
