import { useState, useEffect } from 'preact/hooks';
import { useTranslation } from 'react-i18next';

import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AddIcon from '@mui/icons-material/Add';

import { BallotToken, getBallotTokens, createBallotTokens } from '../data/api';

interface BallotTokensListProps {
  electionId: string;
  adminUuid: string;
}

export function BallotTokensList({ electionId, adminUuid }: BallotTokensListProps) {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState<BallotToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenCopySuccess, setTokenCopySuccess] = useState<{ [key: string]: boolean }>({});
  const [csvCopySuccess, setCsvCopySuccess] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tokenCount, setTokenCount] = useState<number>(1);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    loadTokens();
  }, [electionId, adminUuid]);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const data = await getBallotTokens(electionId, adminUuid);
      setTokens(data);
    } catch (err) {
      console.error('Failed to load tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTokenLink = (tokenId: string) => {
    const tokenUrl = `${window.location.origin}/elections/${electionId}/tokens/${tokenId}`;
    navigator.clipboard.writeText(tokenUrl).then(() => {
      setTokenCopySuccess({ ...tokenCopySuccess, [tokenId]: true });
      setTimeout(() => {
        setTokenCopySuccess(prev => ({ ...prev, [tokenId]: false }));
      }, 2000);
    });
  };

  const handleCopyAllTokensCSV = () => {
    if (tokens.length > 0) {
      const baseUrl = `${window.location.origin}/elections/${electionId}/tokens/`;
      const csv = tokens.map(token => baseUrl + token.id).join('\n');
      navigator.clipboard.writeText(csv).then(() => {
        setCsvCopySuccess(true);
        setTimeout(() => setCsvCopySuccess(false), 2000);
      });
    }
  };

  const handleCreateTokens = async () => {
    if (tokenCount < 1) {
      setCreateError(t('Token count must be at least 1'));
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);
      await createBallotTokens(electionId, adminUuid, tokenCount);
      // Reload tokens after creation
      await loadTokens();
      setTokenCount(1); // Reset to default
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ConfirmationNumberIcon /> {t('Ballot Tokens')}
        </Typography>
        {tokens.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyAllTokensCSV}
          >
            {csvCopySuccess ? t('Copied!') : t('Copy All as CSV')}
          </Button>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" paragraph>
        {t(
          'Ballot tokens allow voters to access their unique voting page. Share these links individually or export all as CSV.'
        )}
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        {t(
          'Important: Each token should be shared with exactly one person. Tokens are unique to each voter and should not be reused or shared publicly.'
        )}
      </Alert>

      {/* Token Creation */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('Create New Tokens')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            label={t('Number of tokens')}
            type="number"
            value={tokenCount}
            onChange={e => {
              setTokenCount(parseInt((e.target as HTMLInputElement).value) || 1);
              if (createError) setCreateError(null);
            }}
            size="small"
            inputProps={{ min: 1 }}
            disabled={creating}
            error={!!createError}
            helperText={createError}
            sx={{ width: 150 }}
          />
          <Button
            variant="contained"
            startIcon={creating ? <CircularProgress size={16} /> : <AddIcon />}
            onClick={handleCreateTokens}
            disabled={creating || tokenCount < 1}
          >
            {creating ? t('Creating...') : t('Create Tokens')}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : tokens.length === 0 ? (
        <Alert severity="info">{t('No ballot tokens have been created yet.')}</Alert>
      ) : (
        <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
          <List dense>
            {tokens.map((token: BallotToken, index: number) => (
              <div key={token.id}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleCopyTokenLink(token.id)}
                      color={tokenCopySuccess[token.id] ? 'success' : 'default'}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={token.id}
                    secondary={
                      token.converted_at
                        ? t('Used on {{date}}', {
                            date: new Date(token.converted_at).toLocaleString(),
                          })
                        : t('Not used yet')
                    }
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { fontFamily: 'monospace', fontSize: '0.9rem' },
                    }}
                  />
                </ListItem>
              </div>
            ))}
          </List>
        </Paper>
      )}
    </Paper>
  );
}
