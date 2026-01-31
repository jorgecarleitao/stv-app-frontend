import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CountingLogProps {
  log: string;
}

export function CountingLog({ log }: CountingLogProps) {
  const { t } = useTranslation();

  return (
    <Accordion elevation={2}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{t('Detailed Counting Log')}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          component="pre"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            maxHeight: '400px',
            overflow: 'auto',
            margin: 0,
          }}
        >
          {log}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
