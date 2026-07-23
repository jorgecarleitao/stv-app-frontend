import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import type { CountingLog, CountingLogActionType } from '../data/api';
import { CandidateCountsBarChart, StatsRow } from './CountingLog';

interface CountingWalkthroughProps {
  log: CountingLog;
}

function describeAction(
  actionType: CountingLogActionType,
  t: (key: string, options?: any) => string,
  quota?: string,
): { short: string; detailed: string } {
  if (typeof actionType === 'string') {
    if (actionType === 'begin_count') {
      return { short: t('Begin Count'), detailed: t('allVotesFullValue') };
    }
    if (actionType === 'count_complete') {
      return { short: t('Count Complete'), detailed: t('countCompleteExplanation') };
    }
    return { short: actionType, detailed: '' };
  }
  if ('elect' in actionType) {
    const c = actionType.elect.candidate;
    return {
      short: `${t('walkthrough.elect')}: ${c}`,
      detailed: t('walkthrough.electDetail', { candidate: c, quota }),
    };
  }
  if ('elect_remaining' in actionType) {
    const c = actionType.elect_remaining.candidate;
    return {
      short: `${t('walkthrough.electRemaining')}: ${c}`,
      detailed: t('walkthrough.electRemainingDetail', { candidate: c }),
    };
  }
  if ('iterate' in actionType) {
    const r = actionType.iterate.reason;
    const reason = r === 'elected'
      ? t('walkthrough.reasonElected')
      : r === 'omega'
        ? t('walkthrough.reasonOmega')
        : r;
    return {
      short: `${t('walkthrough.redistribute')}: ${reason}`,
      detailed: t('walkthrough.iterateDetail'),
    };
  }
  if ('defeat' in actionType) {
    const c = actionType.defeat.candidate;
    return {
      short: `${t('walkthrough.defeat')}: ${c}`,
      detailed: t('walkthrough.defeatDetail', { candidate: c, reason: actionType.defeat.reason }),
    };
  }
  if ('defeat_remaining' in actionType) {
    const c = actionType.defeat_remaining.candidate;
    return {
      short: `${t('walkthrough.defeatRemaining')}: ${c}`,
      detailed: t('walkthrough.defeatRemainingDetail', { candidate: c }),
    };
  }
  if ('break_tie' in actionType) {
    const d = actionType.break_tie.defeated;
    return {
      short: `${t('walkthrough.breakTie')}: ${d}`,
      detailed: t('walkthrough.breakTieDetail', { defeated: d, candidates: actionType.break_tie.candidates.join(', ') }),
    };
  }
  return { short: '', detailed: '' };
}

function RoundWalkthrough({ round, roundNumber, log }: {
  round: CountingLog['rounds'][0];
  roundNumber: number;
  log: CountingLog;
}) {
  const { t } = useTranslation();
  const isFirst = roundNumber === 0;
  const isLast = roundNumber === log.rounds.length - 1;

  return (
    <Card variant="outlined" sx={{ mb: 3, borderColor: isFirst ? 'primary.main' : isLast ? 'success.main' : undefined }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6">
            {t('Round')} {roundNumber + 1}
          </Typography>
          <Chip
            label={isFirst ? t('First preferences') : isLast ? t('Final') : t('Transfer round')}
            size="small"
            color={isFirst ? 'primary' : isLast ? 'success' : 'default'}
          />
        </Box>

        {round.actions.map((action, idx) => {
          const { short, detailed } = describeAction(action.action_type, t, action.stats.quota);

          return (
            <Fragment key={idx}>
              {idx > 0 && <Divider sx={{ my: 2 }} />}

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {short}
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                {detailed}
              </Typography>

              <CandidateCountsBarChart counts={action.candidate_counts} quota={action.stats.quota} />
              <StatsRow stats={action.stats} />
            </Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function CountingWalkthrough({ log }: CountingWalkthroughProps) {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('stepByStepTitle')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('stepByStepIntro')}
      </Typography>

      {log.rounds.map((round) => (
        <RoundWalkthrough
          key={round.round_number}
          round={round}
          roundNumber={round.round_number}
          log={log}
        />
      ))}
    </Box>
  );
}
