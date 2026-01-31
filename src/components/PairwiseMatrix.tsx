import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

interface PairwiseMatrixProps {
  candidates: string[];
  pairwiseMatrix: number[][];
  order: Record<number, number>;
}

export function PairwiseMatrix({ candidates, pairwiseMatrix, order }: PairwiseMatrixProps) {
  const { t } = useTranslation();

  return (
    <Paper elevation={2}>
      <Stack spacing={2} padding={3}>
        <Typography variant="h5" gutterBottom>
          {t('Pairwise Comparison Matrix')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t(
            'Each cell shows how many voters preferred the row candidate over the column candidate'
          )}
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              '& td, & th': {
                border: '1px solid',
                borderColor: 'divider',
                p: 1.5,
                textAlign: 'center',
                minWidth: '80px',
              },
              '& th': {
                bgcolor: 'action.hover',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              },
              '& tbody th': {
                position: 'sticky',
                left: 0,
                bgcolor: 'action.hover',
                zIndex: 1,
              },
            }}
          >
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ minWidth: '120px !important' }}></Box>
                {candidates.map((candidate, idx) => (
                  <Box component="th" key={idx}>
                    <Stack alignItems="center" spacing={0.5}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: '0.75rem',
                          bgcolor: 'primary.main',
                        }}
                      >
                        {order[idx] + 1}
                      </Avatar>
                      <Typography variant="caption">{candidate}</Typography>
                    </Stack>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {candidates.map((candidate, rowIdx) => (
                <Box component="tr" key={rowIdx}>
                  <Box component="th">
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      justifyContent="flex-start"
                    >
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: '0.75rem',
                          bgcolor: 'primary.main',
                        }}
                      >
                        {order[rowIdx] + 1}
                      </Avatar>
                      <Typography variant="body2">{candidate}</Typography>
                    </Stack>
                  </Box>
                  {candidates.map((_, colIdx) => {
                    const value = pairwiseMatrix[rowIdx][colIdx];
                    const opposite = pairwiseMatrix[colIdx][rowIdx];
                    const isWin = rowIdx !== colIdx && value > opposite;
                    const isTie = rowIdx !== colIdx && value === opposite;

                    return (
                      <Box
                        component="td"
                        key={colIdx}
                        sx={{
                          bgcolor:
                            rowIdx === colIdx
                              ? 'action.disabledBackground'
                              : isWin
                                ? 'success.50'
                                : isTie
                                  ? 'warning.50'
                                  : 'inherit',
                          fontWeight: isWin ? 'bold' : 'normal',
                        }}
                      >
                        {rowIdx === colIdx ? '—' : value}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {t(
            'Candidates are ordered by their final ranking (Copeland method). Green cells indicate wins, yellow indicates ties.'
          )}
        </Typography>
      </Stack>
    </Paper>
  );
}
