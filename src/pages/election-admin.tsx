import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import { Page } from '../components/Page';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import {
  getElectionByAdmin,
  updateElectionByAdmin,
  createElection,
  CreateElectionRequest,
  ElectionResponse,
} from '../data/api';
import { BallotTokensList } from '../components/BallotTokensList';
import { ElectionBasicInfo } from '../components/ElectionBasicInfo';
import { ElectionSeatsConfig } from '../components/ElectionSeatsConfig';
import { CandidatesList } from '../components/CandidatesList';
import { ElectionTimeConfig } from '../components/ElectionTimeConfig';

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
      document.title = `${t('Create Election')} - ${t('App title')}`;
    } else if (election) {
      document.title = `${election.title} (${t('Admin')}) - ${t('App title')}`;
    }
  }, [isCreateMode, election, t]);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editNumSeats, setEditNumSeats] = useState(1);
  const [editOrderedSeats, setEditOrderedSeats] = useState(true);
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
    setEditOrderedSeats(data.ordered_seats);
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
        ordered_seats: editOrderedSeats,
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
      <Page title={t('Loading...')} description={t('Election Admin meta description')} noIndex>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  // Only show error page if we're in edit mode and failed to load the election
  if (!isCreateMode && error && !election) {
    return (
      <Page title={t('Admin')} description={t('Election Admin meta description')} noIndex>
        <Button component="a" href="/elections" startIcon={<ArrowBackIcon />}>
          {t('Back to elections')}
        </Button>
        <Alert severity="error">
          {t('Error loading election')}: {error}
        </Alert>
      </Page>
    );
  }

  if (!isCreateMode && !election) {
    return (
      <Page title={t('Admin')} description={t('Election Admin meta description')} noIndex>
        <Button component="a" href="/elections" startIcon={<ArrowBackIcon />}>
          {t('Back to elections')}
        </Button>
        <Alert severity="info">{t('Election not found')}</Alert>
      </Page>
    );
  }

  return (
    <Page
      title={isCreateMode ? t('Create Election') : election?.title || t('Admin')}
      description={t('Election Admin meta description')}
      noIndex
    >
      <Stack direction="row" spacing={2}>
        <Button component="a" href="/elections" startIcon={<ArrowBackIcon />}>
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
        <Alert severity="warning" icon={<AdminPanelSettingsIcon />}>
          <Stack spacing={2}>
            <Typography variant="body1">
              <strong>{t('Administrator Page')}</strong>
            </Typography>
            <Typography variant="body2">
              {t(
                'This page allows full control over the election. Only share this URL with people you trust to administer this election.'
              )}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {`${window.location.origin}/elections/${election.uuid}/admin/${election.admin_uuid}`}
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyAdminUrl}
              >
                {copySuccess ? t('Copied!') : t('Copy')}
              </Button>
            </Stack>
          </Stack>
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      )}

      {!loading && !election && !isCreateMode && (
        <Alert severity="warning">{t('Election not found.')}</Alert>
      )}

      {/* Edit/Create Form */}
      {(isCreateMode || election) && (
        <Stack spacing={3}>
          <Paper elevation={3} sx={{ bgcolor: 'warning.50', p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {isCreateMode ? t('Create New Election') : t('Edit Election Details')}
            </Typography>

            {election?.is_locked && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t(
                  'Title, description, and candidates are locked because voting tokens have been redeemed.'
                )}
              </Alert>
            )}

            <ElectionBasicInfo
              title={editTitle}
              description={editDescription}
              onTitleChange={value => {
                setEditTitle(value);
                if (titleError) setTitleError(null);
              }}
              onDescriptionChange={setEditDescription}
              disabled={saving || election?.is_locked}
              titleError={titleError}
            />

            <Box sx={{ mt: 2 }}>
              <ElectionTimeConfig
                startTime={editStartTime}
                endTime={editEndTime}
                onStartTimeChange={value => {
                  setEditStartTime(value);
                  if (dateTimeError) setDateTimeError(null);
                }}
                onEndTimeChange={value => {
                  setEditEndTime(value);
                  if (dateTimeError) setDateTimeError(null);
                }}
                disabled={saving}
                dateTimeError={dateTimeError}
              />
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {t('Number of seats to elect')}
            </Typography>
            <ElectionSeatsConfig
              numSeats={editNumSeats}
              orderedSeats={editOrderedSeats}
              maxSeats={editCandidates.filter(c => c.trim().length > 0).length}
              onNumSeatsChange={value => {
                setEditNumSeats(value);
                if (seatsError) setSeatsError(null);
              }}
              onOrderedSeatsChange={setEditOrderedSeats}
              disabled={saving}
              seatsError={seatsError}
            />
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {t('Candidates')}
            </Typography>
            <CandidatesList
              candidates={editCandidates}
              onCandidateChange={(index, value) => {
                handleCandidateChange(index, value);
                if (candidatesError) setCandidatesError(null);
              }}
              onAddCandidate={handleAddCandidate}
              onRemoveCandidate={handleRemoveCandidate}
              disabled={saving || election?.is_locked}
              candidatesError={candidatesError}
            />
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? isCreateMode
                    ? t('Creating...')
                    : t('Saving...')
                  : isCreateMode
                    ? t('Create Election')
                    : t('Save Changes')}
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
          </Paper>
        </Stack>
      )}

      {/* Tokens Section - only in edit mode */}
      {!isCreateMode && election && electionId && adminUuid && (
        <BallotTokensList electionId={electionId} adminUuid={adminUuid} />
      )}
    </Page>
  );
}
