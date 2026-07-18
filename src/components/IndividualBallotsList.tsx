import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface IndividualBallotsListProps {
  electionId: string;
  ballots: string[];
}

export function IndividualBallotsList({ electionId, ballots }: IndividualBallotsListProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  return (
    <Accordion elevation={2} sx={{ mb: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">
          {t('Individual Ballots')} ({ballots.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('Ballot ID')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('Action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ballots
                .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                .map((uuid, idx) => (
                  <TableRow key={uuid} hover>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell sx={{ typography: 'body2' }}>
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{uuid}</Box>
                      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{uuid.substring(0, 5)}…</Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        component="a"
                        href={`/elections/${electionId}/ballot/${uuid}`}
                      >
                        {t('View')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <TablePagination
            component="div"
            count={ballots.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt((e.target as HTMLInputElement).value, 10)); setPage(0); }}
            rowsPerPageOptions={[25, 50, 100]}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
