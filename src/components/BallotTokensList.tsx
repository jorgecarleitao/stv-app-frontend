import { useState, useEffect } from 'preact/hooks';
import { useTranslation } from 'react-i18next';

import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

import {
  BallotToken,
  EmailConfig,
  getBallotTokens,
  createBallotTokens,
  sendEmails,
  sendSingleTokenEmail,
  getEmailConfig,
  upsertEmailConfig,
  deleteEmailConfig,
  sendTestEmail,
  patchToken,
  batchMarkSent,
  UpsertEmailConfigRequest,
} from '../data/api';

function parseEmails(input: string): string[] {
  const parts = input.split(/[,\n\r]+/);
  const emails: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const cleaned = trimmed.replace(/,$/, '').trim();
    if (!cleaned || !cleaned.includes('@') || seen.has(cleaned)) continue;
    seen.add(cleaned);
    emails.push(cleaned);
  }
  return emails;
}

interface BallotTokensListProps {
  electionId: string;
  adminUuid: string;
}

export function BallotTokensList({ electionId, adminUuid }: BallotTokensListProps) {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState<BallotToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Token creation
  const [creating, setCreating] = useState(false);
  const [tokenCount, setTokenCount] = useState(1);
  const [recipients, setRecipients] = useState('');

  // Email config
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  // Test email
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  // Send/mark
  const [sending, setSending] = useState<string | null>(null);

  // Copy
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [csvCopied, setCsvCopied] = useState(false);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Track radio button display separately from config state
  const [radioValue, setRadioValue] = useState<'self' | 'email'>('self');

  const isEmail = config !== null;

  useEffect(() => { init(); }, [electionId, adminUuid]);

  // Sync radio display with config changes
  useEffect(() => {
    setRadioValue(isEmail ? 'email' : 'self');
  }, [isEmail]);

  async function init() {
    setLoading(true);
    await Promise.all([loadTokens(), loadConfig()]);
    setLoading(false);
  }

  async function loadConfig() {
    try {
      const c = await getEmailConfig(electionId, adminUuid);
      setConfig(c);
      if (c) {
        setSmtpHost(c.smtp_host);
        setSmtpUser(c.smtp_username);
        setFromName(c.from_name);
        setFromEmail(c.from_email);
      }
    } catch {}
  }

  async function loadTokens() {
    try {
      const data = await getBallotTokens(electionId, adminUuid);
      setTokens(data);
    } catch (err) {
      setError(String(err));
    }
  }

  function handleRadioChange(_: unknown, value: string) {
    if (value === 'email' && !isEmail) {
      setRadioValue('email');
    } else if (value === 'self' && isEmail) {
      setConfirmOpen(true);
    } else if (value === 'self' && !isEmail) {
      setRadioValue('self');
    }
  }

  async function confirmSwitchToSelf() {
    setConfirmOpen(false);
    try {
      await deleteEmailConfig(electionId, adminUuid);
      setConfig(null);
      await loadTokens();
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleCreate() {
    setError(null);
    try {
      setCreating(true);
      if (radioValue === 'email') {
        const parsed = parseEmails(recipients);
        if (!parsed.length) { setError(t('Enter at least one email address')); return; }
        await createBallotTokens(electionId, adminUuid, parsed);
        setRecipients('');
      } else {
        if (tokenCount < 1) { setError(t('Token count must be at least 1')); return; }
        await createBallotTokens(electionId, adminUuid, tokenCount);
        setTokenCount(1);
      }
      await loadTokens();
    } catch (err) {
      setError(String(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveConfig() {
    if (!smtpHost || !smtpUser || !fromName || !fromEmail) {
      setError(t('All fields except password are required'));
      return;
    }
    setError(null);
    try {
      setSavingConfig(true);
      const body: UpsertEmailConfigRequest = {
        smtp_host: smtpHost.trim(),
        smtp_username: smtpUser.trim(),
        from_name: fromName.trim(), from_email: fromEmail.trim(),
        ...(smtpPass ? { smtp_password: smtpPass } : {}),
      };
      await upsertEmailConfig(electionId, adminUuid, body);
      await loadConfig();
    } catch (err) {
      setError(String(err));
    } finally {
      setSavingConfig(false);
    }
  }

  async function handleClearConfig() {
    setError(null);
    try {
      setSavingConfig(true);
      await deleteEmailConfig(electionId, adminUuid);
      setConfig(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setSavingConfig(false);
    }
  }

  async function handleSendTest() {
    if (!testEmail || !testEmail.includes('@')) {
      setError(t('Enter a valid email address'));
      return;
    }
    setError(null);
    setTestSuccess(null);
    try {
      setTesting(true);
      await sendTestEmail(electionId, adminUuid, testEmail.trim());
      setTestSuccess(t('Test email sent to {{email}}', { email: testEmail.trim() }));
    } catch (err) {
      setError(String(err));
    } finally {
      setTesting(false);
    }
  }

  async function handleSend(tokenId: string) {
    setError(null);
    try {
      setSending(tokenId);
      const r = await sendSingleTokenEmail(electionId, adminUuid, tokenId);
      if (r.error) setError(r.error);
      await loadTokens();
    } catch (err) {
      setError(String(err));
    } finally {
      setSending(null);
    }
  }

  async function handleSendAll() {
    setError(null);
    try {
      setSending('__all__');
      await sendEmails(electionId, adminUuid);
      await loadTokens();
    } catch (err) {
      setError(String(err));
    } finally {
      setSending(null);
    }
  }

  async function handleMarkSent(tokenId: string) {
    setError(null);
    try {
      await patchToken(electionId, adminUuid, tokenId, new Date().toISOString());
      await loadTokens();
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleMarkAllSent() {
    setError(null);
    try {
      const now = new Date().toISOString();
      const unsentIds = tokens.filter(t => !t.sent_at && !t.converted_at).map(t => t.id);
      await batchMarkSent(electionId, adminUuid, now, unsentIds);
      await loadTokens();
    } catch (err) {
      setError(String(err));
    }
  }

  function copyUrl(tokenId: string) {
    const url = `${window.location.origin}/elections/${electionId}/tokens/${tokenId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(prev => ({ ...prev, [tokenId]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [tokenId]: false })), 2000);
    });
  }

  function copyCsv() {
    const base = `${window.location.origin}/elections/${electionId}/tokens/`;
    navigator.clipboard.writeText(tokens.map(t => base + t.id).join('\n')).then(() => {
      setCsvCopied(true);
      setTimeout(() => setCsvCopied(false), 2000);
    });
  }

  const pendingCount = radioValue === 'email'
    ? tokens.filter(t => t.email && !t.sent_at).length
    : tokens.filter(t => !t.sent_at && !t.converted_at).length;

  function fmt(d: string | null) {
    if (!d) return null;
    try { return new Date(d).toLocaleString(); } catch { return d; }
  }

  return (
    <Paper elevation={2}>
      <Stack spacing={3} sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <ConfirmationNumberIcon />
            <Typography variant="h5">{t('Ballot Tokens')}</Typography>
          </Stack>
          {tokens.length > 0 && (
            <Button variant="outlined" size="small" startIcon={<ContentCopyIcon />} onClick={copyCsv}>
              {csvCopied ? t('Copied!') : t('Copy All as CSV')}
            </Button>
          )}
        </Stack>

        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {testSuccess && <Alert severity="success" onClose={() => setTestSuccess(null)}>{testSuccess}</Alert>}

        {/* Mode toggle */}
        <RadioGroup row value={radioValue} onChange={handleRadioChange}>
          <FormControlLabel value="self" control={<Radio size="small" />} label={t('Self-delivered')} />
          <FormControlLabel value="email" control={<Radio size="small" />} label={t('By email')} />
        </RadioGroup>

        {radioValue === 'email' && !config && (
          <Alert severity="info">
            {t('Configure email settings to send tokens directly to voters.')}
          </Alert>
        )}

        {/* Confirm dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>{t('Switch to self-delivered?')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('This will delete the email configuration and remove all email addresses from existing tokens.')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>{t('Cancel')}</Button>
            <Button onClick={confirmSwitchToSelf} color="error" variant="contained">
              {t('Switch & Clear')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Email config */}
        {radioValue === 'email' && (
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2">{t('Email Configuration')}</Typography>
                {config && (
                <Alert severity="info">
                  {config.from_name} &lt;{config.from_email}&gt; via {config.smtp_host}
                </Alert>
              )}
              <Stack direction="row" spacing={2}>
                <TextField label={t('SMTP Host')} value={smtpHost} onChange={e => setSmtpHost(e.target.value)} size="small" fullWidth disabled={savingConfig} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label={t('Username')} value={smtpUser} onChange={e => setSmtpUser(e.target.value)} size="small" fullWidth disabled={savingConfig} />
                <TextField label={t('Password')} value={smtpPass} onChange={e => setSmtpPass(e.target.value)} size="small" type="password" fullWidth disabled={savingConfig} placeholder={config ? t('Leave blank to keep current') : ''} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label={t('From Name')} value={fromName} onChange={e => setFromName(e.target.value)} size="small" fullWidth disabled={savingConfig} />
                <TextField label={t('From Email')} value={fromEmail} onChange={e => setFromEmail(e.target.value)} size="small" fullWidth disabled={savingConfig} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={handleSaveConfig} disabled={savingConfig} startIcon={savingConfig ? <CircularProgress size={16} /> : undefined}>
                  {t('Save Configuration')}
                </Button>
              {config && (
                  <Button variant="outlined" color="error" onClick={handleClearConfig} disabled={savingConfig}>{t('Clear')}</Button>
                )}
              </Stack>
              {config && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField label={t('Send Test Email to')} value={testEmail}
                    onChange={e => setTestEmail(e.target.value)} size="small" type="email"
                    sx={{ flexGrow: 1 }} disabled={testing}
                    placeholder={config.from_email} />
                  <Button variant="outlined" onClick={handleSendTest} disabled={testing || !testEmail.trim()}
                    startIcon={testing ? <CircularProgress size={16} /> : undefined}>
                    {testing ? t('Sending...') : t('Send Test')}
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>
        )}

        {/* Token creation */}
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2">{t('Create New Tokens')}</Typography>
            {radioValue === 'email' ? (
              <Stack spacing={2}>
                <TextField label={t('Email addresses (one per line or comma-separated)')} multiline rows={3}
                  value={recipients} onChange={e => setRecipients(e.target.value)} size="small" fullWidth disabled={creating}
                  helperText={recipients.trim() ? `${parseEmails(recipients).length} ${t('token(s) will be created')}` : ''} />
                <Button variant="contained" startIcon={creating ? <CircularProgress size={16} /> : <AddIcon />}
                  onClick={handleCreate} disabled={creating || !recipients.trim()}>
                  {creating ? t('Creating...') : t('Create Tokens')}
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <TextField label={t('Number of tokens')} type="number" value={tokenCount}
                  onChange={e => setTokenCount(parseInt(e.target.value) || 1)} size="small" inputProps={{ min: 1 }}
                  disabled={creating} sx={{ width: 150 }} />
                <Button variant="contained" startIcon={creating ? <CircularProgress size={16} /> : <AddIcon />}
                  onClick={handleCreate} disabled={creating || tokenCount < 1}>
                  {creating ? t('Creating...') : t('Create Tokens')}
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Batch action */}
        {pendingCount > 0 && radioValue === 'self' && (
          <Button variant="outlined" size="small" onClick={handleMarkAllSent}>
            {t('Mark all as sent ({{count}})', { count: pendingCount })}
          </Button>
        )}
        {pendingCount > 0 && radioValue === 'email' && (
          <Button variant="contained" size="small" startIcon={sending === '__all__' ? <CircularProgress size={16} /> : <SendIcon />}
            onClick={handleSendAll} disabled={sending === '__all__'}>
            {sending === '__all__' ? t('Sending...') : t('Send to All Pending ({{count}})', { count: pendingCount })}
          </Button>
        )}

        {/* Token list */}
        {loading ? (
          <Stack alignItems="center" sx={{ py: 2 }}><CircularProgress size={24} /></Stack>
        ) : tokens.length === 0 ? (
          <Alert severity="info">{t('No ballot tokens have been created yet.')}</Alert>
        ) : (
          <Paper variant="outlined" sx={{ maxHeight: 500, overflow: 'auto' }}>
            <List dense>
              {tokens.map((token, i) => (
                <div key={token.id}>
                  {i > 0 && <Divider />}
                  <ListItem secondaryAction={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {radioValue === 'self' && !token.sent_at && !token.converted_at && (
                        <Button size="small" variant="outlined" onClick={() => handleMarkSent(token.id)}>{t('Mark sent')}</Button>
                      )}
                      {radioValue === 'email' && token.email && !token.sent_at && (
                        <IconButton size="small" onClick={() => handleSend(token.id)} disabled={sending === token.id}>
                          {sending === token.id ? <CircularProgress size={16} /> : <SendIcon fontSize="small" />}
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => copyUrl(token.id)} color={copied[token.id] ? 'success' : 'default'}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  }>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{token.id}</Typography>}
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            {token.converted_at ? t('Used on {{date}}', { date: fmt(token.converted_at) }) : t('Not used yet')}
                          </Typography>
                          {token.email && (
                            <Typography variant="caption" color="text.secondary">
                              {token.email}{token.sent_at ? ` — ${t('Sent on {{date}}', { date: fmt(token.sent_at) })}` : ` — ${t('Not sent')}`}
                            </Typography>
                          )}
                          {radioValue === 'self' && !token.email && token.sent_at && (
                            <Typography variant="caption" color="text.secondary">{t('Sent on {{date}}', { date: fmt(token.sent_at) })}</Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                </div>
              ))}
            </List>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}
