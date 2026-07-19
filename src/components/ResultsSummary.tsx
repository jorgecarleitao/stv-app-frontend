import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import type { CountingLog, CountingLogAction } from '../data/api';

interface ResultsSummaryProps {
  log: CountingLog;
  seats: number;
  numElected: number;
  groupName?: string;
}

function CandidateStatusIcon({ status }: { status: CountingLogAction['candidate_counts'][0]['status'] }) {
  if (status === 'elected') return <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32', verticalAlign: 'middle', mr: 0.5 }} />;
  if (status === 'defeated') return <CancelIcon sx={{ fontSize: 18, color: '#d32f2f', verticalAlign: 'middle', mr: 0.5 }} />;
  return <HourglassEmptyIcon sx={{ fontSize: 18, color: '#0288d1', verticalAlign: 'middle', mr: 0.5 }} />;
}

function FinalRoundVotes({ log }: { log: CountingLog }) {
  const lastAction = log.rounds[log.rounds.length - 1]?.actions?.slice(-1)[0];
  if (!lastAction?.candidate_counts?.length) return null;

  const quota = parseFloat(lastAction.stats.quota) || 0;
  const counts = lastAction.candidate_counts;
  const votes = counts.map(c => parseFloat(c.votes) || 0);
  const xMax = Math.max(...votes, quota) || 1;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Final round vote distribution
      </Typography>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', rowGap: 0.75 }}>
          {counts.map(c => {
            const v = parseFloat(c.votes) || 0;
            const belowPct = (Math.min(v, quota) / xMax) * 100;
            const abovePct = (Math.max(0, v - quota) / xMax) * 100;
            const quotaPct = (quota / xMax) * 100;

            return (
              <Fragment key={c.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                  <CandidateStatusIcon status={c.status} />
                  <Typography variant="body2" noWrap>{c.name}</Typography>
                </Box>
                <Tooltip title={c.votes}>
                  <Box sx={{ height: 22, bgcolor: 'action.hover', borderRadius: 1, position: 'relative', overflow: 'hidden' }}>
                    {belowPct > 0 && <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${belowPct}%`, bgcolor: 'primary.light' }} />}
                    {abovePct > 0 && <Box sx={{ position: 'absolute', left: `${belowPct}%`, top: 0, bottom: 0, width: `${abovePct}%`, bgcolor: 'primary.main' }} />}
                    {quota > 0 && <Box sx={{ position: 'absolute', left: `${quotaPct}%`, top: 0, bottom: 0, width: 2, bgcolor: 'warning.main', zIndex: 1 }} />}
                  </Box>
                </Tooltip>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13, pl: 1 }}>{c.votes}</Typography>
              </Fragment>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}

export function ResultsSummary({ log, seats, numElected, groupName }: ResultsSummaryProps) {
  const { t } = useTranslation();
  const { header } = log;
  const numRounds = log.rounds.length;
  const seatLabel = seats === 1 ? 'seat' : 'seats';

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {groupName ? `${t('Group')}: ${groupName}` : t('Results')}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
        <Chip label={`${t('Quota')}: ${header.quota}`} size="small" color="primary" variant="outlined" />
        <Chip label={`${t('Ballots')}: ${header.ballots}`} size="small" variant="outlined" />
        <Chip label={`${t('Rounds')}: ${numRounds}`} size="small" variant="outlined" />
        <Chip label={`${numElected} / ${seats} ${seatLabel}`} size="small" color={numElected >= seats ? 'success' : 'warning'} variant="outlined" />
      </Stack>
      <FinalRoundVotes log={log} />
    </Paper>
  );
}
