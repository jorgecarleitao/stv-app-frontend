import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import LZString from "lz-string";
import * as yaml from "js-yaml";

import { Election } from '../data/frontend';
import { ElectionResult, Elected, simulateElection } from '../data/api';
import { convertToApiElection } from '../data/frontend_to_api';
import { BallotsEditor } from '../ballot';

const defaultElection: Election = {
    candidates: ["Ana", "Rodrigo", "Sara", "Tiago"],
    seats: 3,
    ballots: [
        {
            votes: 10,
            ranks: [3, 2, null, 1],
        },
        {
            votes: 5,
            ranks: [4, 2, 1, 3],
        }
    ],
};

const HEADER = "h5"

interface SimulateProps {
    path?: string;
}

function ElectedList({ elected }: { elected: Elected[] }) {
    const { t } = useTranslation();

    return (
        <Paper elevation={2} sx={{ p: 3, my: 2 }}>
            <Typography variant={HEADER} gutterBottom>
                {t("Elected candidates")}
            </Typography>
            <List>
                {elected.map((e, idx) => (
                    <ListItem key={e.id}>
                        <ListItemAvatar>
                            <Avatar>{e.candidate.charAt(0).toUpperCase()}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={e.candidate}
                            secondary={`Position: ${idx + 1}${e.id !== undefined ? ` (ID: ${e.id + 1})` : ''}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}

interface ElectionBasicsProps {
    election: { seats: number; candidates: string[] };
    setElection: React.Dispatch<React.SetStateAction<{ seats: number; candidates: string[] }>>;
}

function Seats({ election, setElection }: ElectionBasicsProps) {
    const { t } = useTranslation();

    return <Stack spacing={2}>
        <TextField
            label={t("Number of seats to elect")}
            type="number"
            InputProps={{
                inputProps: { min: 1, max: Math.max(1, election.candidates.length) },
                endAdornment: (
                    <InputAdornment position="end">
                        <Tooltip
                            title={t('numberOfSeatsInstructions')}
                            placement="top"
                            arrow
                        >
                            <IconButton tabIndex={-1}>
                                <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </InputAdornment>
                )
            }}
            value={election.seats}
            onChange={e => {
                let val = Number(e.target.value);
                if (val < 1) val = 1;
                if (val > election.candidates.length) val = election.candidates.length;
                setElection(el => ({
                    ...el,
                    number_of_seats: val
                }));
            }}
        />
    </Stack>
}

export default function Simulate({ path }: SimulateProps = {}) {
    const { t } = useTranslation();

    const [election, setElection] = useState<Election>(defaultElection);
    const [yamlText, setYamlText] = useState("");
    const [yamlError, setYamlError] = useState<string | null>(null);
    const [result, setResult] = useState<ElectionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [pendingYaml, setPendingYaml] = useState(""); // used for debounce

    // Track if we've loaded from URL to avoid overwriting it
    const initializedFromUrl = useRef(false);

    // Load from URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get("data");
        if (encoded) {
            try {
                const yamlText = LZString.decompressFromEncodedURIComponent(encoded);
                if (yamlText) {
                    const loaded = yaml.load(yamlText) as Election;
                    setElection(loaded);
                    setYamlText(yamlText);
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
            params.set("data", compressed);

            window.history.replaceState(
                {},
                "",
                `${window.location.pathname}?${params.toString()}`
            );
        }
    }, [election]);

    // Update YAML text when election changes (but not on initial URL load to avoid overwriting)
    useEffect(() => {
        if (initializedFromUrl.current) {
            setYamlText(yaml.dump(election, { noRefs: true, sortKeys: false }));
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
            const apiElection = convertToApiElection(election);
            const res = await simulateElection(apiElection);
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
            candidates: [...e.candidates, `${t("Candidate")} ${e.candidates.length + 1}`],
            ballots: e.ballots.map(b => ({
                ...b,
                ranks: [...b.ranks, null]
            }))
        }));
    };

    const handleRemoveCandidate = (idx: number) => {
        setElection(e => ({
            ...e,
            candidates: e.candidates.filter((_, i) => i !== idx),
            ballots: e.ballots.map(b => ({
                ...b,
                ranks: b.ranks.filter((_, i) => i !== idx)
            }))
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
                }
            ]
        }));
    };

    const handleRemoveBallot = (ballotIdx: number) => {
        setElection(e => ({
            ...e,
            ballots: e.ballots.filter((_, i) => i !== ballotIdx)
        }));
    };

    const handleChangeBallotVotes = (ballotIdx: number, votes: number) => {
        setElection(e => ({
            ...e,
            ballots: e.ballots.map((b, i) =>
                i === ballotIdx ? { ...b, votes } : b
            )
        }));
    };

    const handleChangeBallotRank = (ballotIdx: number, candIdx: number, rank: number | null) => {
        setElection(e => ({
            ...e,
            ballots: e.ballots.map((b, i) =>
                i === ballotIdx
                    ? {
                        ...b,
                        ranks: b.ranks.map((r, cIdx) =>
                            cIdx === candIdx ? rank : r
                        )
                    }
                    : b
            )
        }));
    };

    const handleYamlChange = (val: string) => {
        if (val == "") {
            return
        };
        setYamlText(val);
        try {
            const loaded = yaml.load(val);
            if (
                typeof loaded !== "object" ||
                !loaded ||
                !("candidates" in loaded) ||
                !("seats" in loaded || "seats" in loaded) ||
                !("ballots" in loaded)
            ) {
                setYamlError("YAML is parsed but not recognized as an election structure.");
                return;
            }
            setElection(loaded);
            setYamlError(null);
        } catch (err: any) {
            setYamlError("YAML parse error: " + err.message);
        }
    };

    return (
        <Container>
            <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
                <Typography variant={HEADER} gutterBottom>
                    {t('Number of seats to elect')}
                </Typography>
                <Seats election={election} setElection={setElection} />
            </Paper>

            <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant={HEADER} gutterBottom sx={{ flexGrow: 1 }}>
                        {t('Candidates')}
                    </Typography>
                    <Tooltip
                        title={t('addCandidatesInstructions')}
                        arrow
                        placement="right"
                    >
                        <IconButton size="small" sx={{ ml: 1 }}>
                            <InfoOutlinedIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Stack spacing={2}>
                    {election.candidates.map((name, idx) => (
                        <Box key={idx} display="flex" alignItems="center">
                            <TextField
                                size="small"
                                value={name}
                                label={`Candidate ${idx + 1}`}
                                sx={{ flex: 1, mr: 1 }}
                                onChange={e => handleRenameCandidate(idx, e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title={t("You can change the candidate's name here.")}
                                                arrow
                                                placement="top"
                                            >
                                                <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5 }} />
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Tooltip
                                title={election.candidates.length <= 1
                                    ? t("At least one candidate is required")
                                    : t("Remove this candidate")}
                                arrow
                            >
                                <span>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleRemoveCandidate(idx)}
                                        disabled={election.candidates.length <= 1}
                                    >
                                        {t('Remove')}
                                    </Button>
                                </span>
                            </Tooltip>
                        </Box>
                    ))}
                    <Tooltip
                        title={t("Click to add a new candidate to the list")}
                        arrow
                    >
                        <Button variant="contained" onClick={handleAddCandidate}>
                            {t('Add Candidate')}
                        </Button>
                    </Tooltip>
                </Stack>
            </Paper>
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant={HEADER} gutterBottom>
                        {t('Ballot groups')}
                    </Typography>
                    <Tooltip
                        arrow
                        placement="right"
                        title={t('editBallotsInstructions')}
                    >
                        <IconButton size="small" sx={{ ml: 1 }}>
                            <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <BallotsEditor
                    candidates={election.candidates}
                    ballots={election.ballots}
                    onChangeBallotVotes={handleChangeBallotVotes}
                    onChangeBallotRank={handleChangeBallotRank}
                    onAddBallot={handleAddBallot}
                    onRemoveBallot={handleRemoveBallot}
                />
            </Paper>

            <Box mb={4} mt={2} display="flex" justifyContent="center">
                <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={handleRunElection}
                    disabled={loading}
                >
                    {loading ? t("Running...") : t("Run Election")}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            {result && <ElectedList elected={result.elected} />}
            {result && (
                <Accordion elevation={4} sx={{ p: 2, my: 2 }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="steps-content"
                        id="steps-header"
                    >
                        <Typography variant={HEADER}>
                            {t('Detailed STV log')}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <pre style={{ margin: 0 }}>{result.log}</pre>
                    </AccordionDetails>
                </Accordion>
            )}

            <Paper elevation={4} sx={{ p: 2, my: 2 }}>
                <Typography variant={HEADER} gutterBottom>
                    {t('Load/Save election')}
                </Typography>
                <TextField
                    label="YAML"
                    multiline
                    minRows={8}
                    maxRows={20}
                    fullWidth
                    value={yamlText}
                    onChange={e => setPendingYaml(e.target.value)}
                    placeholder={t("Edit election YAML here...")}
                    sx={{ mb: 1 }}
                    error={!!yamlError}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip
                                    title={t('loadSaveYamlInstructions')}
                                    placement="top"
                                    arrow
                                >
                                    <IconButton tabIndex={-1}>
                                        <InfoOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                    }}
                />
                {yamlError && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                        {yamlError}
                    </Alert>
                )}
            </Paper>
        </Container>
    );
}
