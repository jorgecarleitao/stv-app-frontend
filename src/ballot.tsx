import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { Ballot } from './data/api';
import { BallotGroupDisplay } from './components/BallotGroupDisplay';

export function BallotsEditor({
  candidates,
  ballots,
  onChangeBallotVotes,
  onChangeBallotRank,
  onAddBallot,
  onRemoveBallot,
}: {
  candidates: string[];
  ballots: Ballot[];
  onChangeBallotVotes: (ballotIdx: number, votes: number) => void;
  onChangeBallotRank: (ballotIdx: number, candIdx: number, rank: number | null) => void;
  onAddBallot: () => void;
  onRemoveBallot: (ballotIdx: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      {ballots.map((b, ballotIdx) => (
        <BallotGroupDisplay
          key={ballotIdx}
          candidates={candidates}
          ballot={b}
          groupNumber={ballotIdx + 1}
          onChangeVotes={votes => onChangeBallotVotes(ballotIdx, votes)}
          onChangeRank={(candIdx, rank) => onChangeBallotRank(ballotIdx, candIdx, rank)}
          onRemove={() => onRemoveBallot(ballotIdx)}
        />
      ))}
      <Button variant="contained" onClick={onAddBallot}>
        {t('Add Ballot group')}
      </Button>
    </Stack>
  );
}
