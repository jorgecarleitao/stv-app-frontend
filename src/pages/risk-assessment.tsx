import { useTranslation } from 'react-i18next';
import { Page } from '../components/Page';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface RiskAssessmentProps {
  path?: string;
}

interface Threat {
  threat: string;
  description: string;
  likelihood: string;
  impact: string;
  mitigation: string;
  residualRisk: string;
}

export default function RiskAssessment({}: RiskAssessmentProps = {}) {
  const { t } = useTranslation();

  const risks: Threat[] = [
    {
      threat: t('riskAssessment.threat.tokenInterception.title'),
      description: t('riskAssessment.threat.tokenInterception.description'),
      likelihood: t('riskAssessment.threat.tokenInterception.likelihood'),
      impact: t('riskAssessment.threat.tokenInterception.impact'),
      mitigation: t('riskAssessment.threat.tokenInterception.mitigation'),
      residualRisk: t('riskAssessment.threat.tokenInterception.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.ballotTokenTheft.title'),
      description: t('riskAssessment.threat.ballotTokenTheft.description'),
      likelihood: t('riskAssessment.threat.ballotTokenTheft.likelihood'),
      impact: t('riskAssessment.threat.ballotTokenTheft.impact'),
      mitigation: t('riskAssessment.threat.ballotTokenTheft.mitigation'),
      residualRisk: t('riskAssessment.threat.ballotTokenTheft.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.databaseCompromise.title'),
      description: t('riskAssessment.threat.databaseCompromise.description'),
      likelihood: t('riskAssessment.threat.databaseCompromise.likelihood'),
      impact: t('riskAssessment.threat.databaseCompromise.impact'),
      mitigation: t('riskAssessment.threat.databaseCompromise.mitigation'),
      residualRisk: t('riskAssessment.threat.databaseCompromise.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.serverCompromise.title'),
      description: t('riskAssessment.threat.serverCompromise.description'),
      likelihood: t('riskAssessment.threat.serverCompromise.likelihood'),
      impact: t('riskAssessment.threat.serverCompromise.impact'),
      mitigation: t('riskAssessment.threat.serverCompromise.mitigation'),
      residualRisk: t('riskAssessment.threat.serverCompromise.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.coercion.title'),
      description: t('riskAssessment.threat.coercion.description'),
      likelihood: t('riskAssessment.threat.coercion.likelihood'),
      impact: t('riskAssessment.threat.coercion.impact'),
      mitigation: t('riskAssessment.threat.coercion.mitigation'),
      residualRisk: t('riskAssessment.threat.coercion.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.ddos.title'),
      description: t('riskAssessment.threat.ddos.description'),
      likelihood: t('riskAssessment.threat.ddos.likelihood'),
      impact: t('riskAssessment.threat.ddos.impact'),
      mitigation: t('riskAssessment.threat.ddos.mitigation'),
      residualRisk: t('riskAssessment.threat.ddos.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.adminUuidLeakage.title'),
      description: t('riskAssessment.threat.adminUuidLeakage.description'),
      likelihood: t('riskAssessment.threat.adminUuidLeakage.likelihood'),
      impact: t('riskAssessment.threat.adminUuidLeakage.impact'),
      mitigation: t('riskAssessment.threat.adminUuidLeakage.mitigation'),
      residualRisk: t('riskAssessment.threat.adminUuidLeakage.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.supplyChain.title'),
      description: t('riskAssessment.threat.supplyChain.description'),
      likelihood: t('riskAssessment.threat.supplyChain.likelihood'),
      impact: t('riskAssessment.threat.supplyChain.impact'),
      mitigation: t('riskAssessment.threat.supplyChain.mitigation'),
      residualRisk: t('riskAssessment.threat.supplyChain.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.voterPrivacy.title'),
      description: t('riskAssessment.threat.voterPrivacy.description'),
      likelihood: t('riskAssessment.threat.voterPrivacy.likelihood'),
      impact: t('riskAssessment.threat.voterPrivacy.impact'),
      mitigation: t('riskAssessment.threat.voterPrivacy.mitigation'),
      residualRisk: t('riskAssessment.threat.voterPrivacy.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.resultManipulation.title'),
      description: t('riskAssessment.threat.resultManipulation.description'),
      likelihood: t('riskAssessment.threat.resultManipulation.likelihood'),
      impact: t('riskAssessment.threat.resultManipulation.impact'),
      mitigation: t('riskAssessment.threat.resultManipulation.mitigation'),
      residualRisk: t('riskAssessment.threat.resultManipulation.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.phishing.title'),
      description: t('riskAssessment.threat.phishing.description'),
      likelihood: t('riskAssessment.threat.phishing.likelihood'),
      impact: t('riskAssessment.threat.phishing.impact'),
      mitigation: t('riskAssessment.threat.phishing.mitigation'),
      residualRisk: t('riskAssessment.threat.phishing.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.clientSideCompromise.title'),
      description: t('riskAssessment.threat.clientSideCompromise.description'),
      likelihood: t('riskAssessment.threat.clientSideCompromise.likelihood'),
      impact: t('riskAssessment.threat.clientSideCompromise.impact'),
      mitigation: t('riskAssessment.threat.clientSideCompromise.mitigation'),
      residualRisk: t('riskAssessment.threat.clientSideCompromise.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.lostTokenAccess.title'),
      description: t('riskAssessment.threat.lostTokenAccess.description'),
      likelihood: t('riskAssessment.threat.lostTokenAccess.likelihood'),
      impact: t('riskAssessment.threat.lostTokenAccess.impact'),
      mitigation: t('riskAssessment.threat.lostTokenAccess.mitigation'),
      residualRisk: t('riskAssessment.threat.lostTokenAccess.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.timingAnalysis.title'),
      description: t('riskAssessment.threat.timingAnalysis.description'),
      likelihood: t('riskAssessment.threat.timingAnalysis.likelihood'),
      impact: t('riskAssessment.threat.timingAnalysis.impact'),
      mitigation: t('riskAssessment.threat.timingAnalysis.mitigation'),
      residualRisk: t('riskAssessment.threat.timingAnalysis.residualRisk'),
    },
    {
      threat: t('riskAssessment.threat.hostingProvider.title'),
      description: t('riskAssessment.threat.hostingProvider.description'),
      likelihood: t('riskAssessment.threat.hostingProvider.likelihood'),
      impact: t('riskAssessment.threat.hostingProvider.impact'),
      mitigation: t('riskAssessment.threat.hostingProvider.mitigation'),
      residualRisk: t('riskAssessment.threat.hostingProvider.residualRisk'),
    },
  ];

  return (
    <Page
      title={t('riskAssessment.pageTitle')}
      description={t('riskAssessment.pageDescription')}
    >
      <Typography variant="body1" paragraph>
        {t('riskAssessment.intro')}
      </Typography>

      <Alert severity="warning">
        <AlertTitle>{t('riskAssessment.scopeTitle')}</AlertTitle>
        {t('riskAssessment.scopeTextPre')}
        <strong> {t('riskAssessment.scopeTextBold')}</strong>
        {t('riskAssessment.scopeTextPost')}
      </Alert>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('riskAssessment.methodologyTitle')}
        </Typography>
        <Typography variant="body2" paragraph>
          {t('riskAssessment.methodologyIntro')}
        </Typography>
        <Box>
          <Typography variant="body2" component="div">
            <strong>{t('riskAssessment.likelihoodLabel')}</strong> {t('riskAssessment.likelihoodValues')}
          </Typography>
          <Typography variant="body2" component="div">
            <strong>{t('riskAssessment.impactLabel')}</strong> {t('riskAssessment.impactValues')}
          </Typography>
          <Typography variant="body2" component="div">
            <strong>{t('riskAssessment.residualRiskLabel')}</strong> {t('riskAssessment.residualRiskDesc')}
          </Typography>
        </Box>
      </Paper>

      <Box>
        <Typography variant="h5" gutterBottom>
          {t('riskAssessment.threatsTitle')}
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>{t('riskAssessment.table.threat')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('riskAssessment.table.description')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('riskAssessment.table.likelihood')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('riskAssessment.table.impact')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('riskAssessment.table.mitigation')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('riskAssessment.table.residualRisk')}</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {risks.map((risk, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    <strong>{risk.threat}</strong>
                  </TableCell>
                  <TableCell>{risk.description}</TableCell>
                  <TableCell>{risk.likelihood}</TableCell>
                  <TableCell>{risk.impact}</TableCell>
                  <TableCell>{risk.mitigation}</TableCell>
                  <TableCell>{risk.residualRisk}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('riskAssessment.securityArchitectureTitle')}
        </Typography>

        <Typography variant="h6">{t('riskAssessment.ballotAnonymizationTitle')}</Typography>
        <Typography variant="body2" paragraph>
          {t('riskAssessment.ballotAnonymizationText')}
        </Typography>

        <Typography variant="h6">{t('riskAssessment.noAuthTitle')}</Typography>
        <Typography variant="body2" paragraph>
          {t('riskAssessment.noAuthText')}
        </Typography>

        <Typography variant="h6">{t('riskAssessment.publicAuditabilityTitle')}</Typography>
        <Typography variant="body2" paragraph>
          {t('riskAssessment.publicAuditabilityText')}
        </Typography>

        <Typography variant="h6">{t('riskAssessment.singleUseTokensTitle')}</Typography>
        <Typography variant="body2" paragraph>
          {t('riskAssessment.singleUseTokensText')}
        </Typography>

        <Typography variant="h6">{t('riskAssessment.electionLockingTitle')}</Typography>
        <Typography variant="body2" paragraph>
          {t('riskAssessment.electionLockingText')}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('riskAssessment.technicalMeasuresTitle')}
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.technicalMeasures.database.label')}</strong> {t('riskAssessment.technicalMeasures.database.text')}
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.technicalMeasures.deployment.label')}</strong> {t('riskAssessment.technicalMeasures.deployment.text')}
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.technicalMeasures.tls.label')}</strong> {t('riskAssessment.technicalMeasures.tls.text')}
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.technicalMeasures.inputValidation.label')}</strong> {t('riskAssessment.technicalMeasures.inputValidation.text')}
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.technicalMeasures.atomicity.label')}</strong> {t('riskAssessment.technicalMeasures.atomicity.text')}
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.technicalMeasures.openSource.label')}</strong> {t('riskAssessment.technicalMeasures.openSource.text')}
                </>
              }
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('riskAssessment.recommendationsTitle')}
        </Typography>

        <Typography variant="body2" paragraph>
          {t('riskAssessment.recommendationsIntro')}
        </Typography>

        <List sx={{ listStyleType: 'decimal', pl: 4 }}>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.recommendation1.label')}</strong> {t('riskAssessment.recommendation1.text')}
                </>
              }
            />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.recommendation2.label')}</strong> {t('riskAssessment.recommendation2.text')}
                </>
              }
            />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.recommendation3.label')}</strong> {t('riskAssessment.recommendation3.text')}
                </>
              }
            />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.recommendation4.label')}</strong> {t('riskAssessment.recommendation4.text')}
                </>
              }
            />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.recommendation5.label')}</strong> {t('riskAssessment.recommendation5.text')}
                </>
              }
            />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText
              primary={
                <>
                  <strong>{t('riskAssessment.recommendation6.label')}</strong> {t('riskAssessment.recommendation6.text')}
                </>
              }
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('riskAssessment.openSourceTitle')}
        </Typography>
        <Typography variant="body2">
          {t('riskAssessment.openSourcePrefix')}{' '}
          <Link href="https://github.com/jorgecarleitao/stv-app" target="_blank" rel="noopener noreferrer">
            {t('riskAssessment.openSourceBackend')}
          </Link>
          {', '}
          <Link href="https://github.com/jorgecarleitao/stv-app-frontend" target="_blank" rel="noopener noreferrer">
            {t('riskAssessment.openSourceFrontend')}
          </Link>
          {', '}
          <Link href="https://github.com/jorgecarleitao/stv-app-infrastructure" target="_blank" rel="noopener noreferrer">
            {t('riskAssessment.openSourceInfrastructure')}
          </Link>
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('riskAssessment.conclusionTitle')}
        </Typography>
        <Typography variant="body2" paragraph>
          {t('riskAssessment.conclusionPara1')}
        </Typography>
        <Typography variant="body2">
          {t('riskAssessment.conclusionPara2Pre')}{' '}
          <strong>{t('riskAssessment.conclusionPara2Bold')}</strong>
          {t('riskAssessment.conclusionPara2Post')}
        </Typography>
      </Paper>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
        {t('riskAssessment.lastUpdated')}
      </Typography>
    </Page>
  );
}
