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

import { simulateElection } from '../data/api';
import { Election, ElectionResult, ElectionType } from '../data/types';
import { DEFAULT_ELECTION } from '../data/defaults';
import { ElectionResults } from '../components/ElectionResults';
import { ElectionSeatsConfig } from '../components/ElectionSeatsConfig';
import { CandidatesList } from '../components/CandidatesList';
import { getSystem } from '../systems';

// Convert UI ranks (1-based) to API ranks (0-based)
function toApiRanks(ranks: (number | null)[]): (number | null)[] {
  return ranks.map(r => (r === null ? null : r - 1));
}

// Convert API ranks (0-based) to UI ranks (1-based)
function fromApiRanks(ranks: (number | null)[]): (number | null)[] {
  return ranks.map(r => (r === null ? null : r + 1));
}

const HEADER = 'h5';

interface SimulateProps {
  path?: string;
}

export default function Simulate({ path }: SimulateProps = {}) {
  const { t } = useTranslation();

  const pageTitle = `${t('Simulate')} - ${t('App title')}`;
  const metaDescription = t('Simulate meta description');

  const [election, setElection] = useState<Election>(DEFAULT_ELECTION);
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
          setElection({
            ...loaded,
            election_type: (loaded.election_type ?? 'stv-md') as ElectionType,
          } as Election);
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
      setElection({
        ...loaded,
        election_type: ((loaded as any).election_type ?? 'stv-md') as ElectionType,
      } as Election);
      setYamlError(null);
    } catch (err: any) {
      setYamlError('YAML parse error: ' + err.message);
    }
  };

  const system = getSystem(election.election_type);
  const SystemConfigSection = system.ConfigSection;
  const SystemBallotEditor = system.BallotEditor;
  const SystemResultSections = system.ResultSections;

  const canRun =
    election.candidates.length >= 2 && election.seats > 0 && election.ballots.length > 0;
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
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={t('loadSaveYamlInstructions')} placement="top" arrow>
                      <IconButton tabIndex={-1}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
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
              const extras = getSystem(val).defaultExtras(el.candidates);
              return {
                ...el,
                election_type: val,
                groups: extras.groups,
                candidate_groups: extras.candidateGroups,
              };
            });
          }}
        />
      </Paper>

      {SystemConfigSection && (
        <SystemConfigSection
          extras={{ groups: election.groups ?? [], candidateGroups: election.candidate_groups ?? [] }}
          onExtrasChange={extras =>
            setElection(el => ({
              ...el,
              groups: extras.groups,
              candidate_groups: extras.candidateGroups,
            }))
          }
        />
      )}

      <Paper elevation={4} sx={{ p: 3 }}>
        <Typography variant={HEADER} gutterBottom>
          {t('Candidates')}
        </Typography>
        <CandidatesList
          candidates={election.candidates}
          electionType={election.election_type}
          {...system.candidatesExtras(
            { groups: election.groups ?? [], candidateGroups: election.candidate_groups ?? [] },
            handleCandidateGroupChange
          )}
          onCandidateChange={handleRenameCandidate}
          onAddCandidate={handleAddCandidate}
          onRemoveCandidate={handleRemoveCandidate}
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
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
          <SystemBallotEditor
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

      <Tooltip title={!canRun ? `Need at least 2 candidates, 1 seat, and 1 ballot group` : ''}>
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
        <ElectionResults result={result} electionType={election.election_type} />
      )}

      {result && (
        <SystemResultSections
          result={result}
          candidates={election.candidates}
          seats={election.seats}
        />
      )}
    </Page>
  );
}
