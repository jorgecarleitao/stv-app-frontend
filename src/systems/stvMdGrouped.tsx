import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import type { ElectionSystemUI, ElectionExtras } from './types';
import {
  LogDetails,
  LogSummary,
  rankedBallotPayload,
  rankedBallotRanks,
} from './ranked';
import { BallotsEditor } from '../ballot';
import { GroupConfigList } from '../components/GroupConfigList';
import type { CreateElectionRequest, GroupConfig } from '../data/types';

function GroupedConfigSection({
  extras,
  onExtrasChange,
  disabled,
}: {
  extras: ElectionExtras;
  onExtrasChange: (e: ElectionExtras) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('Groups')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t(
          'Define groups and seat allocation per group. Total group seats must equal total seats.'
        )}
      </Typography>
      <GroupConfigList
        groups={extras.groups}
        onGroupsChange={(groups: GroupConfig[]) => onExtrasChange({ ...extras, groups })}
        disabled={disabled}
      />
    </Paper>
  );
}

const StvMdGrouped: ElectionSystemUI = {
  id: 'stv-md-grouped',
  label: 'STV-MD Grouped (by groups)',
  hasExtras: true,
  defaultExtras: (candidates: string[]): ElectionExtras => ({
    groups: [
      { name: 'Group A', seats: 1 },
      { name: 'Group B', seats: 1 },
    ],
    candidateGroups: candidates.map(() => ''),
  }),
  validateExtras: (t, extras, candidates, numSeats) => {
    const { groups, candidateGroups } = extras;
    if (groups.length < 2) {
      return { field: 'general', message: t('At least 2 groups are required for grouped elections') };
    }
    const names = groups.map(g => g.name.trim());
    if (names.some(n => !n)) {
      return { field: 'general', message: t('All groups must have a name') };
    }
    if (new Set(names).size !== names.length) {
      return { field: 'general', message: t('Group names must be unique') };
    }
    const totalGroupSeats = groups.reduce((sum, g) => sum + g.seats, 0);
    if (totalGroupSeats !== numSeats) {
      return { field: 'seats', message: t('Sum of group seats must equal total seats') };
    }
    const assigned = candidateGroups.filter(g => g.trim().length > 0);
    if (assigned.length < candidates.length) {
      return { field: 'candidates', message: t('All candidates must be assigned to a group') };
    }
    return null;
  },
  buildRequest: (common, extras): CreateElectionRequest => ({
    ...common,
    election_type: 'stv-md-grouped' as const,
    groups: extras.groups,
    candidate_groups: extras.candidateGroups,
  }),
  ConfigSection: GroupedConfigSection,
  candidatesExtras: (extras, onCandidateGroupChange) => ({
    groups: extras.groups,
    candidateGroups: extras.candidateGroups,
    onCandidateGroupChange,
  }),
  BallotEditor: BallotsEditor,
  ballotPayload: rankedBallotPayload,
  readBallotRanks: rankedBallotRanks,
  resultsMode: 'grouped',
  ResultSections: ({ result, seats }) => (
    <>
      <LogSummary result={result} seats={seats} />
      <LogDetails result={result} />
    </>
  ),
};

export default StvMdGrouped;
