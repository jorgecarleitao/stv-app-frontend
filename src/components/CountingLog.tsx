import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import WithdrawnIcon from '@mui/icons-material/Cancel';
import ElectedIcon from '@mui/icons-material/CheckCircle';
import DefeatedIcon from '@mui/icons-material/Cancel';
import HopefulIcon from '@mui/icons-material/HourglassEmpty';

import type { CountingLog, CountingLogAction } from '../data/api';

interface CountingLogProps {
  log: CountingLog;
  groupName?: string;
  defaultExpanded?: boolean;
}

function formatActionType(
  actionType: CountingLogAction['action_type'],
  t: (key: string) => string
): string {
  if (typeof actionType === 'string') {
    if (actionType === 'begin_count') return t('Begin Count');
    if (actionType === 'count_complete') return t('Count Complete');
    return actionType;
  }
  if ('elect' in actionType) return `${t('Elect')}: ${actionType.elect.candidate}`;
  if ('elect_remaining' in actionType)
    return `${t('Elect remaining')}: ${actionType.elect_remaining.candidate}`;
  if ('iterate' in actionType) return `${t('Iterate')}: ${actionType.iterate.reason}`;
  if ('defeat' in actionType)
    return `${t('Defeat')}: ${actionType.defeat.candidate} (${actionType.defeat.reason})`;
  if ('defeat_remaining' in actionType)
    return `${t('Defeat remaining')}: ${actionType.defeat_remaining.candidate}`;
  if ('break_tie' in actionType)
    return `${t('Break tie')}: ${actionType.break_tie.defeated} ${t('defeated from')} [${actionType.break_tie.candidates.join(', ')}]`;
  return '';
}


function HeaderSection({ log }: { log: CountingLog }) {
  const { t } = useTranslation();
  const { header } = log;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {header.title || t('Counting Log')}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        <Chip label={`${t('Rule')}: ${header.rule}`} size="small" />
        <Chip label={`${t('Arithmetic')}: ${header.arithmetic}`} size="small" />
        <Chip label={`${t('Seats')}: ${header.seats}`} size="small" />
        <Chip label={`${t('Ballots')}: ${header.ballots}`} size="small" />
        <Chip label={`${header.ballots} / (${header.seats} + 1)`} size="small" />
      </Stack>
    </Paper>
  );
}

function CandidatesSection({ candidates }: { candidates: CountingLog['candidates'] }) {
  const { t } = useTranslation();
  const active = candidates.filter(c => !c.withdrawn);
  const withdrawn = candidates.filter(c => c.withdrawn);

  return (
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
      {active.map(c => (
        <Chip key={c.name} label={c.name} size="small" color="primary" variant="outlined" />
      ))}
      {withdrawn.map(c => (
        <Chip
          key={c.name}
          label={c.name}
          size="small"
          color="default"
          variant="outlined"
          icon={<WithdrawnIcon />}
          sx={{ textDecoration: 'line-through', opacity: 0.6 }}
        />
      ))}
      {withdrawn.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
          ({withdrawn.length} {t('withdrawn')})
        </Typography>
      )}
    </Stack>
  );
}

export function StatsRow({ stats }: { stats: CountingLog['rounds'][0]['actions'][0]['stats'] }) {
  const { t } = useTranslation();
  const hasAny = stats.votes || stats.residual || stats.total || stats.surplus;
  if (!hasAny) return null;

  const rows = [
    stats.votes !== '' && { label: t('Votes'), value: stats.votes, tooltip: t('votesTooltip') },
    stats.residual !== '' && {
      label: t('Residual'),
      value: stats.residual,
      tooltip: t('residualTooltip'),
      prefix: '+',
    },
    stats.total !== '' && {
      label: t('Total'),
      value: stats.total,
      tooltip: t('totalTooltip'),
      prefix: '=',
      bold: true,
    },
    stats.surplus !== '' && {
      label: t('Surplus'),
      value: stats.surplus,
      tooltip: t('surplusTooltip'),
    },
  ].filter(Boolean) as {
    label: string;
    value: string;
    tooltip: string;
    prefix?: string;
    bold?: boolean;
  }[];

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
      <Table size="small">
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.label}>
              <TableCell sx={{ width: 24, pr: 0, borderBottom: 'none', py: 0 }}>
                {row.prefix || ''}
              </TableCell>
              <Tooltip title={row.tooltip} arrow placement="left">
                <TableCell
                  sx={{ borderBottom: 'none', py: 0.25, fontWeight: row.bold ? 'bold' : 'normal' }}
                >
                  {row.label}
                </TableCell>
              </Tooltip>
              <TableCell
                align="right"
                sx={{
                  borderBottom: 'none',
                  py: 0.25,
                  fontFamily: 'monospace',
                  fontWeight: row.bold ? 'bold' : 'normal',
                }}
              >
                {row.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function CandidateStatusIcon({ status }: { status: CountingLogAction['candidate_counts'][0]['status'] }) {
  if (status === 'elected') return <ElectedIcon sx={{ fontSize: 18, color: '#2e7d32', verticalAlign: 'middle', mr: 0.5 }} />;
  if (status === 'defeated') return <DefeatedIcon sx={{ fontSize: 18, color: '#d32f2f', verticalAlign: 'middle', mr: 0.5 }} />;
  return <HopefulIcon sx={{ fontSize: 18, color: '#0288d1', verticalAlign: 'middle', mr: 0.5 }} />;
}

export function CandidateCountsBarChart({
  counts,
  quota,
}: {
  counts: CountingLogAction['candidate_counts'];
  quota: string;
}) {
  if (counts.length === 0) return null;

  const quotaVal = parseFloat(quota) || 0;
  const votes = counts.map(c => parseFloat(c.votes) || 0);
  const xMax = Math.max(...votes, quotaVal) || 1;

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', rowGap: 0.75 }}>
        {counts.map((c) => {
          const v = parseFloat(c.votes) || 0;
          const belowPct = (Math.min(v, quotaVal) / xMax) * 100;
          const abovePct = (Math.max(0, v - quotaVal) / xMax) * 100;
          const quotaPct = (quotaVal / xMax) * 100;
          const isDefeated = c.status === 'defeated';

          return (
            <Fragment key={c.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                <CandidateStatusIcon status={c.status} />
                <Typography variant="body2" noWrap>{c.name}</Typography>
              </Box>
              <Tooltip title={c.votes}>
                <Box sx={{ height: 22, bgcolor: 'action.hover', borderRadius: 1, position: 'relative', overflow: 'hidden' }}>
                  {belowPct > 0 && <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${belowPct}%`, bgcolor: isDefeated ? 'primary.main' : 'primary.light' }} />}
                  {abovePct > 0 && <Box sx={{ position: 'absolute', left: `${belowPct}%`, top: 0, bottom: 0, width: `${abovePct}%`, bgcolor: 'primary.main' }} />}
                  {quotaVal > 0 && <Box sx={{ position: 'absolute', left: `${quotaPct}%`, top: 0, bottom: 0, width: 2, bgcolor: 'warning.main', zIndex: 1 }} />}
                </Box>
              </Tooltip>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13, pl: 1 }}>{c.votes}</Typography>
            </Fragment>
          );
        })}
      </Box>
    </Paper>
  );
}

function RoundCard({ round }: { round: CountingLog['rounds'][0] }) {
  const { t } = useTranslation();

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('Round')} {round.round_number + 1}
        </Typography>
        {round.actions.map((action, idx) => (
          <Box key={idx} sx={{ mb: 2 }}>
            {idx > 0 && <Divider sx={{ my: 1.5 }} />}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              {formatActionType(action.action_type, t)}
            </Typography>
            <CandidateCountsBarChart counts={action.candidate_counts} quota={action.stats.quota} />
            <StatsRow stats={action.stats} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

export function CountingLog({ log, groupName, defaultExpanded }: CountingLogProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const [roundPage, setRoundPage] = useState(0);
  const [roundsPerPage, setRoundsPerPage] = useState(5);

  const paginatedRounds = log.rounds.slice(
    roundPage * roundsPerPage,
    (roundPage + 1) * roundsPerPage,
  );

  const title = groupName
    ? `${t('Counting Log')}: ${groupName}`
    : t('Detailed Counting Log');

  return (
    <Accordion elevation={2} expanded={expanded} onChange={(_, e) => setExpanded(e)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {expanded && (
          <>
            <HeaderSection log={log} />
            <CandidatesSection candidates={log.candidates} />
            {paginatedRounds.map(round => (
              <RoundCard key={round.round_number} round={round} />
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <TablePagination
                component="div"
                count={log.rounds.length}
                page={roundPage}
                onPageChange={(_, p) => setRoundPage(p)}
                rowsPerPage={roundsPerPage}
                onRowsPerPageChange={e => { setRoundsPerPage(parseInt((e.target as HTMLInputElement).value, 10)); setRoundPage(0); }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Box>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
