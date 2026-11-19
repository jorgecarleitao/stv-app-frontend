import React from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '../components/Page';
import { Typography, Box, Paper, Card, CardContent, Chip } from '@mui/material';
import { getSystem, goals } from '../systems';

interface Props {
  path?: string;
}

export default function AdminUserGuide({ path }: Props = {}) {
  const { t } = useTranslation();

  const pageTitle = `${t('Admin Guide')} - ${t('App title')}`;
  const metaDescription = t('Admin Guide meta description');

  const steps = [
    {
      primary: t('Create a new election'),
      secondary: t('Set the title, description, candidates, number of seats, and start/end dates.'),
      hint: t(
        "When you create an election, you'll receive a unique admin page URL. Save this link and share it only with other trusted administrators."
      ),
    },
    {
      primary: t('Generate voting tokens'),
      secondary: t(
        'On the admin page, generate ballot tokens for each voter. Each token is a unique secret link that grants access to one ballot.'
      ),
      hint: t(
        'Generate as many tokens as you have eligible voters. You can create tokens in batches.'
      ),
    },
    {
      primary: t('Distribute tokens to voters'),
      secondary: t(
        'Send each token link individually to the respective voter. The voter should redeem the token privately - only they will have access to their ballot.'
      ),
      hint: t(
        'Important: tokens can only be redeemed while the election is open. The system ensures ballot anonymity: administrators cannot see which ballot corresponds to which token.'
      ),
    },
    {
      primary: t('Monitor election progress'),
      secondary: t(
        'Track voting progress on the admin page. You can see how many tokens have been redeemed and how many ballots have been cast.'
      ),
      hint: t('You cannot see how individual voters voted. All ballots are anonymous once cast.'),
    },
    {
      primary: t('Close and publish results'),
      secondary: t(
        'After the voting period ends, results are calculated automatically and published on the public election page.'
      ),
      hint: t(
        'The system shows elected candidates, optional Copeland ranking, detailed counting rounds, and the pairwise comparison matrix. For grouped elections, results are displayed per group with separate counting logs for each group.'
      ),
    },
  ];
  return (
    <Page title={t('Admin Guide')} description={metaDescription}>
      <Typography variant="body1" gutterBottom>
        {t(
          'This guide is for election administrators - members of an electoral commission or individuals delegated by the commission to manage an election.'
        )}
      </Typography>

      <Paper elevation={2} sx={{ p: 3, my: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          {t('Understanding Election Pages')}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {t('Each election has two pages:')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box>
            <Chip label={t('Public Page')} size="small" color="success" sx={{ mr: 1 }} />
            <Typography variant="body2" component="span">
              {t(
                'This is where election results are published and voters can view election details. Safe to share publicly.'
              )}
            </Typography>
          </Box>
          <Box>
            <Chip label={t('Admin Page')} size="small" color="warning" sx={{ mr: 1 }} />
            <Typography variant="body2" component="span">
              {t(
                'This page is created when you set up a new election and provides full control: generate tokens, edit details, and manage voting. Share only with trusted administrators.'
              )}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, my: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          {t('What do you want to elect?')}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {t(
            'When creating an election, you first choose what you want to elect. The platform automatically uses the right counting method for that goal:'
          )}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {goals.map(goal => {
            const system = getSystem(goal.systemId);
            return (
              <Box key={goal.id}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {t(goal.titleKey)}
                  <Chip
                    size="small"
                    variant="outlined"
                    label={t(system.label)}
                    sx={{ ml: 1, verticalAlign: 'middle' }}
                  />
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {t(goal.descKey)}
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }} gutterBottom>
                  {t(goal.exampleKey)}
                </Typography>
                {goal.noteKey && (
                  <Typography variant="body2" color="text.secondary">
                    {t(goal.noteKey)}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        {t('Steps for Administrators:')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {steps.map((item, index) => (
          <Card key={item.primary} elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Chip
                  label={index + 1}
                  color="primary"
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {item.primary}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.secondary}
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{ p: 1.5, bgcolor: 'info.light', borderLeft: 3, borderColor: 'info.main' }}
                  >
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {item.hint}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Page>
  );
}
