import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import { PairwiseMatrix } from './PairwiseMatrix';
import { BeatpathMatrix, PairwiseOutcomes } from './BeatpathTable';

interface SchulzeWalkthroughProps {
  candidates: string[];
  pairwiseMatrix: number[][];
  beatpaths: number[][];
  winnerId: number;
}

function StepCard({
  step,
  titleKey,
  textKey,
  children,
}: {
  step: number;
  titleKey: string;
  textKey: string;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {step}. {t(titleKey)}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
        {t(textKey)}
      </Typography>
      {children}
    </Paper>
  );
}

/**
 * Visual, interleaved walkthrough of a Schulze count: each step shows its
 * explanation together with the corresponding matrix, instead of one opaque
 * single-round log.
 */
export function SchulzeWalkthrough({
  candidates,
  pairwiseMatrix,
  beatpaths,
  winnerId,
}: SchulzeWalkthroughProps) {
  const { t } = useTranslation();

  // Display order for the pairwise matrix: winner first, then by number of
  // pairwise wins (Copeland-style), then by original index.
  const order = useMemo(() => {
    const wins = candidates.map((_, i) => {
      let w = 0;
      for (let j = 0; j < candidates.length; j++) {
        if (i !== j && pairwiseMatrix[i][j] > pairwiseMatrix[j][i]) w++;
      }
      return w;
    });
    const idxs = candidates.map((_, i) => i);
    idxs.sort((a, b) => {
      if (a === winnerId) return -1;
      if (b === winnerId) return 1;
      if (wins[a] !== wins[b]) return wins[b] - wins[a];
      return a - b;
    });
    const o: Record<string, number> = {};
    idxs.forEach((cand, pos) => {
      o[String(cand)] = pos;
    });
    return o;
  }, [candidates, pairwiseMatrix, winnerId]);

  return (
    <Stack>
      <StepCard step={1} titleKey="sys.schulze.step1Title" textKey="sys.schulze.exampleStep1">
        <PairwiseMatrix
          candidates={candidates}
          pairwiseMatrix={pairwiseMatrix}
          order={order}
          captionKey="sys.pairwiseCaptionSchulze"
        />
      </StepCard>

      <StepCard step={2} titleKey="sys.schulze.step2Title" textKey="sys.schulze.exampleStep2">
        <BeatpathMatrix candidates={candidates} beatpaths={beatpaths} winnerId={winnerId} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          {t('sys.schulze.exampleStep3')}
        </Typography>
      </StepCard>

      <StepCard step={3} titleKey="sys.schulze.step3Title" textKey="sys.beatpathDesc">
        <PairwiseOutcomes
          candidates={candidates}
          pairwiseMatrix={pairwiseMatrix}
          beatpaths={beatpaths}
        />
      </StepCard>

      <Alert severity="success" sx={{ mb: 3 }}>
        <strong>{t('sys.schulze.exampleStep4')}</strong>{' '}
        {t('sys.schulze.winnerBanner', { winner: candidates[winnerId] })}
      </Alert>
    </Stack>
  );
}
