import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface BeatpathTableProps {
  candidates: string[];
  pairwiseMatrix: number[][];
  beatpaths: number[][];
  winnerId: number;
}

/**
 * Explains a Schulze result: the pairwise vote counts, the strongest-path
 * (beatpath) strengths derived from them, and which candidate beats which.
 * Cell (row i, column j) shows p[i][j]; green when i beats j (p[i][j] > p[j][i]).
 */
export function BeatpathTable({
  candidates,
  pairwiseMatrix,
  beatpaths,
  winnerId,
}: BeatpathTableProps) {
  const { t } = useTranslation();
  const n = candidates.length;

  const pairs: {
    a: number;
    b: number;
    votesA: number;
    votesB: number;
    pathA: number;
    pathB: number;
  }[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push({
        a: i,
        b: j,
        votesA: pairwiseMatrix[i][j],
        votesB: pairwiseMatrix[j][i],
        pathA: beatpaths[i][j],
        pathB: beatpaths[j][i],
      });
    }
  }

  return (
    <Paper elevation={2}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('sys.beatpathTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('sys.beatpathDesc')}
        </Typography>

        <TableContainer>
          <Table
            size="small"
            sx={{
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
                p: 1.5,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }} />
                {candidates.map((c, idx) => (
                  <TableCell
                    key={idx}
                    sx={{ fontWeight: 'bold', bgcolor: 'action.hover', minWidth: 100 }}
                  >
                    {c}
                    {idx === winnerId && ` (${t('Winner')})`}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((c, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                    {c}
                    {i === winnerId && ` (${t('Winner')})`}
                  </TableCell>
                  {candidates.map((_, j) => {
                    const v = beatpaths[i][j];
                    const cls =
                      i === j
                        ? { bgcolor: 'action.hover' }
                        : v > beatpaths[j][i]
                          ? { bgcolor: 'success.light', fontWeight: 'bold' }
                          : v < beatpaths[j][i]
                            ? { bgcolor: 'error.light' }
                            : {};
                    return (
                      <TableCell key={j} sx={cls}>
                        {i === j ? '—' : v}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>
          {t('sys.pairwiseOutcomes')}
        </Typography>
        <Stack spacing={0.5}>
          {pairs.map(({ a, b, votesA, votesB, pathA, pathB }) => {
            const winner = pathA > pathB ? a : pathB > pathA ? b : null;
            const label =
              winner === null
                ? t('sys.pairTie', {
                    a: candidates[a],
                    b: candidates[b],
                    votes: `${votesA}–${votesB}`,
                    paths: `${pathA} vs ${pathB}`,
                  })
                : t('sys.pairWin', {
                    winner: candidates[winner],
                    loser: candidates[winner === a ? b : a],
                    votes: winner === a ? `${votesA}–${votesB}` : `${votesB}–${votesA}`,
                    paths: winner === a ? `${pathA} vs ${pathB}` : `${pathB} vs ${pathA}`,
                  });
            return (
              <Typography key={`${a}-${b}`} variant="body2">
                {label}
              </Typography>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}
