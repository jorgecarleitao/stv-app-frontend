import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { getElectionByAdmin, updateElectionByAdmin, createElection, CreateElectionRequest, ElectionResponse } from '../data/api';
import { BallotTokensList } from '../components/BallotTokensList';

interface ElectionAdminProps {
    path?: string;
    electionId?: string;
    adminUuid?: string;
}

export default function ElectionAdmin({ electionId, adminUuid }: ElectionAdminProps) {
    const { t } = useTranslation();
    const [election, setElection] = useState<ElectionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    
    // Determine if we're in create mode (no electionId) or edit mode
    const isCreateMode = !electionId;

    useEffect(() => {
        if (isCreateMode) {
            document.title = `${t('Create Election')} - ${t('STV election runner')}`;
        } else if (election) {
            document.title = `${election.title} (Admin) - ${t('STV election runner')}`;
        }
    }, [isCreateMode, election, t]);
    
    // Edit form state
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editNumSeats, setEditNumSeats] = useState(1);
    const [editCandidates, setEditCandidates] = useState<string[]>(['']);
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    
    // Field-specific errors
    const [titleError, setTitleError] = useState<string | null>(null);
    const [candidatesError, setCandidatesError] = useState<string | null>(null);
    const [seatsError, setSeatsError] = useState<string | null>(null);
    const [dateTimeError, setDateTimeError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [copyPublicSuccess, setCopyPublicSuccess] = useState(false);

    useEffect(() => {
        if (electionId && adminUuid) {
            loadElection();
        } else if (isCreateMode) {
            // In create mode, we're already "ready" with empty form
            setLoading(false);
        }
    }, [electionId, adminUuid]);

    const loadElection = async () => {
        if (!electionId || !adminUuid) return;

        try {
            setLoading(true);
            setError(null);
            const data = await getElectionByAdmin(electionId, adminUuid);
            setElection(data);
            initializeEditForm(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const initializeEditForm = (data: ElectionResponse) => {
        setEditTitle(data.title);
        setEditDescription(data.description || '');
        setEditNumSeats(data.num_seats);
        setEditCandidates([...data.candidates]);
        setEditStartTime(formatDateTimeLocal(new Date(data.start_time)));
        setEditEndTime(formatDateTimeLocal(new Date(data.end_time)));
    };

    const formatDateTimeLocal = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleCancelEdit = () => {
        if (isCreateMode) {
            window.location.href = '/elections';
        } else if (election) {
            initializeEditForm(election);
        }
    };

    const handleSave = async () => {
        if (!isCreateMode && (!electionId || !adminUuid)) return;

        // Clear all field errors
        setTitleError(null);
        setCandidatesError(null);
        setSeatsError(null);
        setDateTimeError(null);
        setError(null);

        let hasError = false;

        // Validate title and candidates
        if (!editTitle.trim()) {
            setTitleError(t('Title is required'));
            hasError = true;
        }

        const validCandidates = editCandidates.filter(c => c.trim().length > 0);
        if (validCandidates.length < 2) {
            setCandidatesError(t('At least 2 candidates are required'));
            hasError = true;
        }

        // Validate number of seats
        if (editNumSeats < 1 || editNumSeats > validCandidates.length) {
            setSeatsError(t('Number of seats must be between 1 and the number of candidates'));
            hasError = true;
        }

        // Validate datetime fields
        if (!editStartTime || !editEndTime) {
            setDateTimeError(t('Start and end times are required'));
            hasError = true;
        } else {
            const startDate = new Date(editStartTime);
            const endDate = new Date(editEndTime);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                setDateTimeError(t('Invalid date format'));
                hasError = true;
            } else if (startDate >= endDate) {
                setDateTimeError(t('End time must be after start time'));
                hasError = true;
            }
        }

        if (hasError) {
            return;
        }

        // All validations passed
        const startDate = new Date(editStartTime);
        const endDate = new Date(editEndTime);

        try {
            setSaving(true);

            const request: CreateElectionRequest = {
                title: editTitle.trim(),
                description: editDescription.trim() || null,
                candidates: validCandidates,
                num_seats: editNumSeats,
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
            };

            if (isCreateMode) {
                // Create new election
                const created = await createElection(request);
                // Redirect to the admin page for the newly created election
                window.location.href = `/elections/${created.uuid}/admin/${created.admin_uuid}`;
            } else {
                // Update existing election
                const updated = await updateElectionByAdmin(electionId!, adminUuid!, request);
                setElection(updated);
            }
        } catch (err) {
            // API errors shown at the top
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSaving(false);
        }
    };

    const handleCandidateChange = (index: number, value: string) => {
        const newCandidates = [...editCandidates];
        newCandidates[index] = value;
        setEditCandidates(newCandidates);
    };

    const handleAddCandidate = () => {
        setEditCandidates([...editCandidates, '']);
    };

    const handleRemoveCandidate = (index: number) => {
        if (editCandidates.length > 1) {
            const newCandidates = editCandidates.filter((_, i) => i !== index);
            setEditCandidates(newCandidates);
        }
    };

    const handleCopyAdminUrl = () => {
        if (election) {
            const adminUrl = `${window.location.origin}/elections/${election.uuid}/admin/${election.admin_uuid}`;
            navigator.clipboard.writeText(adminUrl).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            });
        }
    };

    const handleCopyPublicUrl = () => {
        if (electionId) {
            const publicUrl = `${window.location.origin}/elections/${electionId}`;
            navigator.clipboard.writeText(publicUrl).then(() => {
                setCopyPublicSuccess(true);
                setTimeout(() => setCopyPublicSuccess(false), 2000);
            });
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    // Only show error page if we're in edit mode and failed to load the election
    if (!isCreateMode && error && !election) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Button
                        component="a"
                        href="/elections"
                        startIcon={<ArrowBackIcon />}
                        sx={{ mb: 2 }}
                    >
                        {t('Back to elections')}
                    </Button>
                    <Alert severity="error">
                        {t('Error loading election')}: {error}
                    </Alert>
                </Box>
            </Container>
        );
    }

    if (!isCreateMode && !election) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Button
                        component="a"
                        href="/elections"
                        startIcon={<ArrowBackIcon />}
                        sx={{ mb: 2 }}
                    >
                        {t('Back to elections')}
                    </Button>
                    <Alert severity="info">
                        {t('Election not found')}
                    </Alert>
                </Box>
            </Container>
        );
    }

    const start = election ? new Date(election.start_time) : null;
    const end = election ? new Date(election.end_time) : null;
    const now = new Date();
    const votingOpen = start && end && now >= start && now < end;

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button
                        component="a"
                        href="/elections"
                        startIcon={<ArrowBackIcon />}
                    >
                        {t('Back to elections')}
                    </Button>
                    {!isCreateMode && (
                        <>
                            <Button
                                component="a"
                                href={`/elections/${electionId}`}
                                variant="outlined"
                                startIcon={<VisibilityIcon />}
                            >
                                {t('View Public Page')}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ContentCopyIcon />}
                                onClick={handleCopyPublicUrl}
                            >
                                {copyPublicSuccess ? t('Copied!') : t('Copy Public Link')}
                            </Button>
                        </>
                    )}
                </Stack>

                {/* Admin Badge - only show in edit mode */}
                {!isCreateMode && election && (
                    <Alert severity="warning" icon={<AdminPanelSettingsIcon />} sx={{ mb: 3 }}>
                        <Typography variant="body1">
                            <strong>{t('Administrator Page')}</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {t('This page allows full control over the election. Only share this URL with people you trust to administer this election.')}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                                flex: 1,
                                p: 1.5,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                wordBreak: 'break-all',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                {`${window.location.origin}/elections/${election.uuid}/admin/${election.admin_uuid}`}
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ContentCopyIcon />}
                                onClick={handleCopyAdminUrl}
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                {copySuccess ? t('Copied!') : t('Copy')}
                            </Button>
                        </Box>
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {!loading && !election && !isCreateMode && (
                    <Alert severity="warning">
                        {t('Election not found or you do not have access.')}
                    </Alert>
                )}

                {/* Edit/Create Form */}
                {(isCreateMode || election) && (
                    <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'warning.50' }}>
                        <Typography variant="h5" gutterBottom>
                            {isCreateMode ? t('Create New Election') : t('Edit Election Details')}
                        </Typography>
                        
                        {election?.is_locked && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                {t('Title, description, and candidates are locked because voting tokens have been redeemed.')}
                            </Alert>
                        )}
                        
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                label={t('Election Title')}
                                value={editTitle}
                                onChange={(e) => {
                                    setEditTitle((e.target as HTMLInputElement).value);
                                    if (titleError) setTitleError(null);
                                }}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                                disabled={saving || election?.is_locked}
                                error={!!titleError}
                                helperText={titleError}
                            />

                            <TextField
                                label={t('Description')}
                                value={editDescription}
                                onChange={(e) => setEditDescription((e.target as HTMLInputElement).value)}
                                fullWidth
                                multiline
                                rows={3}
                                sx={{ mb: 2 }}
                                disabled={saving || election?.is_locked}
                            />

                            <TextField
                                label={t('Number of Seats')}
                                type="number"
                                value={editNumSeats}
                                onChange={(e) => {
                                    setEditNumSeats(parseInt((e.target as HTMLInputElement).value) || 1);
                                    if (seatsError) setSeatsError(null);
                                }}
                                fullWidth
                                required
                                inputProps={{ min: 1 }}
                                sx={{ mb: 3 }}
                                disabled={saving}
                                error={!!seatsError}
                                helperText={seatsError}
                            />

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <strong>{t('Candidates')}</strong>
                                    <Button
                                        startIcon={<AddIcon />}
                                        size="small"
                                        onClick={handleAddCandidate}
                                        disabled={saving || election?.is_locked}
                                    >
                                        {t('Add Candidate')}
                                    </Button>
                                </Box>
                                
                                <Stack spacing={1}>
                                    {editCandidates.map((candidate, index) => (
                                        <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                label={`${t('Candidate')} ${index + 1}`}
                                                value={candidate}
                                                onChange={(e) => {
                                                    handleCandidateChange(index, (e.target as HTMLInputElement).value);
                                                    if (candidatesError) setCandidatesError(null);
                                                }}
                                                fullWidth
                                                size="small"
                                                disabled={saving || election?.is_locked}
                                            />
                                            <IconButton
                                                onClick={() => handleRemoveCandidate(index)}
                                                disabled={saving || editCandidates.length <= 1 || election?.is_locked}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Stack>
                                {candidatesError && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                        {candidatesError}
                                    </Typography>
                                )}
                            </Box>

                            <TextField
                                label={t('Start Time')}
                                type="datetime-local"
                                value={editStartTime}
                                onChange={(e) => {
                                    setEditStartTime((e.target as HTMLInputElement).value);
                                    if (dateTimeError) setDateTimeError(null);
                                }}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                                InputLabelProps={{ shrink: true }}
                                disabled={saving}
                                error={!!dateTimeError}
                            />

                            <TextField
                                label={t('End Time')}
                                type="datetime-local"
                                value={editEndTime}
                                onChange={(e) => {
                                    setEditEndTime((e.target as HTMLInputElement).value);
                                    if (dateTimeError) setDateTimeError(null);
                                }}
                                fullWidth
                                required
                                sx={{ mb: 1 }}
                                InputLabelProps={{ shrink: true }}
                                disabled={saving}
                                error={!!dateTimeError}
                            />
                            
                            {dateTimeError && (
                                <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
                                    {dateTimeError}
                                </Typography>
                            )}

                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (isCreateMode ? t('Creating...') : t('Saving...')) : (isCreateMode ? t('Create Election') : t('Save Changes'))}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<CancelIcon />}
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                >
                                    {t('Cancel')}
                                </Button>
                            </Stack>
                        </Box>
                    </Paper>
                )}

                {/* Tokens Section - only in edit mode */}
                {!isCreateMode && election && electionId && adminUuid && (
                    <BallotTokensList
                        electionId={electionId}
                        adminUuid={adminUuid}
                    />
                )}
            </Box>
        </Container>
    );
}
