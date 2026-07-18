import { useMemo, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

interface PairwiseMatrixProps {
  candidates: string[];
  pairwiseMatrix: number[][];
  order: Record<string, number>;
}

interface Comparison {
  candidateIdx: number;
  candidate: string;
  candidateOrder: number;
  opponentIdx: number;
  opponent: string;
  opponentOrder: number;
  value: number;
  opposite: number;
  result: 'win' | 'tie' | 'loss';
}

export function PairwiseMatrix({ candidates, pairwiseMatrix, order }: PairwiseMatrixProps) {
  const { t } = useTranslation();
  const [candidateFilter, setCandidateFilter] = useState('');
  const [opponentFilter, setOpponentFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const comparisons = useMemo(() => {
    if (candidates.length <= 5) return [];
    const items: Comparison[] = [];
    for (let i = 0; i < candidates.length; i++) {
      for (let j = 0; j < candidates.length; j++) {
        if (i === j) continue;
        const value = pairwiseMatrix[i][j];
        const opposite = pairwiseMatrix[j][i];
        items.push({
          candidateIdx: i,
          candidate: candidates[i],
          candidateOrder: order[String(i)] + 1,
          opponentIdx: j,
          opponent: candidates[j],
          opponentOrder: order[String(j)] + 1,
          value,
          opposite,
          result: value > opposite ? 'win' : value === opposite ? 'tie' : 'loss',
        });
      }
    }
    return items;
  }, [candidates, pairwiseMatrix, order]);

  const filtered = useMemo(() => {
    if (candidates.length <= 5) return [];
    const qCandidate = candidateFilter.toLowerCase();
    const qOpponent = opponentFilter.toLowerCase();
    return comparisons.filter(
      c =>
        c.candidate.toLowerCase().includes(qCandidate) &&
        c.opponent.toLowerCase().includes(qOpponent),
    );
  }, [comparisons, candidateFilter, opponentFilter, candidates.length]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt((event.target as HTMLInputElement).value, 10));
    setPage(0);
  };

  if (candidates.length <= 5) {
    return (
      <Paper elevation={2}>
        <Stack spacing={2} padding={3}>
          <Typography variant="h5" gutterBottom>
            {t('Pairwise Comparison Matrix')}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('Each cell shows how many voters preferred the row candidate over the column candidate')}
          </Typography>
          <TableContainer>
            <Table size="small" sx={{ '& th, & td': { border: '1px solid', borderColor: 'divider', textAlign: 'center', p: 1.5 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 120, fontWeight: 'bold', bgcolor: 'action.hover', position: 'sticky', left: 0, zIndex: 2 }} />
                  {candidates.map((candidate, idx) => (
                    <TableCell key={idx} sx={{ fontWeight: 'bold', bgcolor: 'action.hover', position: 'sticky', top: 0, zIndex: 1, minWidth: 100 }}>
                      <Stack alignItems="center" spacing={0.5}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                          {order[String(idx)] + 1}
                        </Avatar>
                        <Typography variant="caption">{candidate}</Typography>
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((candidate, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover', position: 'sticky', left: 0, zIndex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                          {order[String(rowIdx)] + 1}
                        </Avatar>
                        <Typography variant="body2">{candidate}</Typography>
                      </Stack>
                    </TableCell>
                    {candidates.map((_, colIdx) => {
                      const value = pairwiseMatrix[rowIdx][colIdx];
                      const opposite = pairwiseMatrix[colIdx][rowIdx];
                      const isDiagonal = rowIdx === colIdx;
                      const isWin = !isDiagonal && value > opposite;
                      const isTie = !isDiagonal && value === opposite;
                      return (
                        <TableCell
                          key={colIdx}
                          sx={{
                            bgcolor: isDiagonal ? 'action.disabledBackground' : isWin ? 'success.50' : isTie ? 'warning.50' : 'inherit',
                            fontWeight: isWin ? 'bold' : 'normal',
                          }}
                        >
                          {isDiagonal ? '—' : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary">
            {t('Candidates are ordered by their final ranking (Copeland method). Green cells indicate wins, yellow indicates ties.')}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper elevation={2}>
      <Stack spacing={2} padding={3}>
        <Typography variant="h5" gutterBottom>
          {t('Pairwise Comparison Matrix')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('Each cell shows how many voters preferred the row candidate over the column candidate')}
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <TextField
            size="small"
            placeholder={t('Search candidate')}
            value={candidateFilter}
            onChange={e => { setCandidateFilter((e.target as HTMLInputElement).value); setPage(0); }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            sx={{ minWidth: 200 }}
          />
          <TextField
            size="small"
            placeholder={t('Search opponent')}
            value={opponentFilter}
            onChange={e => { setOpponentFilter((e.target as HTMLInputElement).value); setPage(0); }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            sx={{ minWidth: 200 }}
          />
        </Stack>
        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            {candidateFilter || opponentFilter
              ? t('No matches found')
              : t('Use the search fields above to explore pairwise comparisons')}
          </Typography>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('Candidate')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('Opponent')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('Preferences')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('Result')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((c, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Typography variant="body2">
                          #{c.candidateOrder} {c.candidate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          #{c.opponentOrder} {c.opponent}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        {c.value}–{c.opposite}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: c.result === 'win' ? 'success.main' : c.result === 'tie' ? 'warning.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        {c.result === 'win' ? t('Win') : c.result === 'tie' ? t('Tie') : t('Loss')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
}
