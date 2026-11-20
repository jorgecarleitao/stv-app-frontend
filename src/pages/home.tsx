import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ScienceIcon from '@mui/icons-material/Science';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import GroupsIcon from '@mui/icons-material/Groups';
import BalanceIcon from '@mui/icons-material/Balance';
import { getSystem, goals, GoalId } from '../systems';

const GOAL_ICONS: Record<GoalId, typeof PersonIcon> = {
  single: PersonIcon,
  ordered: FormatListNumberedIcon,
  multi: GroupsIcon,
  parity: BalanceIcon,
};

interface HomeProps {
  path?: string;
}

export default function Home({}: HomeProps = {}) {
  const { t } = useTranslation();

  const appTitle = t('App title');
  const metaDescription = t('Meta description');

  return (
    <Container maxWidth="lg">
      <SEO title={appTitle} description={metaDescription} />
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', my: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {t('App title')}
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          {t('heroSubtitle')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            component="a"
            href="/elections/create"
            startIcon={<AddCircleIcon />}
          >
            {t('Create Election')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            component="a"
            href="/simulate"
            startIcon={<ScienceIcon />}
          >
            {t('Try Simulator')}
          </Button>
          <Button
            variant="text"
            size="large"
            component="a"
            href="/admin-guide"
            startIcon={<MenuBookIcon />}
          >
            {t('Admin Guide')}
          </Button>
        </Box>
      </Box>

      {/* Goals Section — the primary organization of the site */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          {t('What do you want to elect?')}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4, maxWidth: (theme: any) => theme.spacing(90), mx: 'auto' }}
        >
          {t('goalSectionIntro')}
        </Typography>
        <Grid container spacing={3}>
          {goals.map(goal => {
            const system = getSystem(goal.systemId);
            const Icon = GOAL_ICONS[goal.id];
            return (
              <Grid key={goal.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  elevation={3}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Icon
                        sx={{
                          fontSize: (theme: any) => theme.spacing(4.5),
                          mr: 1.5,
                          color: 'primary.main',
                        }}
                      />
                      <Typography variant="h6" component="h3">
                        {t(goal.titleKey)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t(goal.descKey)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 2 }}
                    >
                      {t(goal.exampleKey)}
                    </Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={t('Counted with: {{method}}', { method: t(system.label) })}
                    />
                  </CardContent>
                  <CardActions
                    disableSpacing
                    sx={{ p: 2, pt: 0, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      component="a"
                      href={`/elections/create?goal=${goal.id}`}
                    >
                      {t('Start this election')}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      component="a"
                      href={`/simulate?goal=${goal.id}`}
                    >
                      {t('Try in simulator')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* How it works — the methods, demoted to secondary detail */}
      <Paper elevation={2} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {t('technicalDetailsTitle')}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {t('technicalDetailsPara1')}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {t('technicalDetailsPara2')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {t('technicalDetailsFooter')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
          <Button variant="contained" component="a" href="/elections/create">
            {t('Create Election')}
          </Button>
          <Button variant="outlined" component="a" href="/goals">
            {t('See how each goal is counted')}
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.open('https://github.com/jorgecarleitao/stv-app', '_blank')}
          >
            {t('View Source Code')}
          </Button>
          <Button variant="outlined" component="a" href="/risk-assessment">
            {t('Risk Assessment')}
          </Button>
        </Box>
      </Paper>

      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', my: 6, p: 4, bgcolor: 'action.hover', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          {t('readyToStartTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t('readyToStartDesc')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3, flexWrap: 'wrap' }}>
          <Button variant="contained" size="large" component="a" href="/elections/create">
            {t('Create Election')}
          </Button>
          <Button variant="outlined" size="large" component="a" href="/admin-guide">
            {t('Admin Guide')}
          </Button>
          <Button variant="outlined" size="large" component="a" href="/simulate">
            {t('Simulate')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
