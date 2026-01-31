import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { BallotGroupDisplay } from './BallotGroupDisplay';

interface Ballot {
  votes: number;
  ranks: (number | null)[];
}

interface ResultsBallotGroupsProps {
  candidates: string[];
  ballots: Ballot[];
  showIcon?: boolean;
}

export function ResultsBallotGroups({
  candidates,
  ballots,
  showIcon = false,
}: ResultsBallotGroupsProps) {
  const { t } = useTranslation();

  const totalVotes = ballots.reduce((sum, b) => sum + b.votes, 0);

  return (
    <Accordion elevation={2}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          paddingRight={2}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {showIcon && <HowToVoteIcon />}
            <Typography variant="h5">{t('Combined Ballots')}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {ballots.length} {t('unique patterns')} • {totalVotes} {t('total votes')}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {ballots.map((ballot, idx) => (
            <BallotGroupDisplay
              key={idx}
              candidates={candidates}
              ballot={ballot}
              groupNumber={idx + 1}
              readOnly={true}
              subtitle={`${ballot.votes} ${ballot.votes === 1 ? t('vote') : t('votes')}`}
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
