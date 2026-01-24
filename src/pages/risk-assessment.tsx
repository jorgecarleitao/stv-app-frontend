import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface RiskAssessmentProps {
  path?: string;
}

export default function RiskAssessment({}: RiskAssessmentProps = {}) {
  const { t } = useTranslation();

  const risks = [
    {
      threat: 'Token Interception',
      description: 'An attacker intercepts a ballot token URL during distribution',
      likelihood: 'Medium',
      impact: 'Low',
      mitigation:
        'Tokens are single-use UUIDs. Use secure distribution channels (encrypted messaging, email). Electoral commission should use secure communication.',
      residualRisk: 'Low',
    },
    {
      threat: 'Ballot Token Theft',
      description: 'An attacker obtains a ballot token before the voter uses it',
      likelihood: 'Low',
      impact: 'Low',
      mitigation:
        'Tokens are single-use and can only be redeemed once. If a voter notices their token was used, they can report to electoral commission.',
      residualRisk: 'Low',
    },
    {
      threat: 'Database Compromise',
      description: 'An attacker gains access to the database',
      likelihood: 'Low',
      impact: 'High',
      mitigation:
        'Election results remain valid (ballots are public after election). Unredeemed tokens could be compromised. Use strong access controls, regular backups, and security updates.',
      residualRisk: 'Medium',
    },
    {
      threat: 'Server Compromise',
      description: 'An attacker gains control of the server',
      likelihood: 'Low',
      impact: 'Critical',
      mitigation:
        'Regular security updates, minimal exposed ports, proper firewall configuration. Deploy using Docker with non-root user. Use reverse proxy with automatic TLS.',
      residualRisk: 'Medium',
    },
    {
      threat: 'Coercion/Vote Buying',
      description: 'Voter is forced to vote a certain way or sells their vote',
      likelihood: 'Varies',
      impact: 'Medium',
      mitigation:
        'Ballot UUID is only known to the voter. However, voters can prove how they voted by sharing their ballot UUID. Unsuitable for elections with high coercion risk.',
      residualRisk: 'High',
    },
    {
      threat: 'Denial of Service (DDoS)',
      description: 'Attackers overwhelm the server to prevent voting',
      likelihood: 'Low',
      impact: 'High',
      mitigation:
        'STVote.eu is protected by Cloudflare, providing enterprise-grade DDoS mitigation. Additional protections: rate limiting at application level, automatic TLS via Caddy. If service disruption occurs, voting period can be extended.',
      residualRisk: 'Low',
    },
    {
      threat: 'Admin UUID Leakage',
      description: 'Election admin UUID is exposed allowing unauthorized modifications',
      likelihood: 'Low',
      impact: 'High',
      mitigation:
        'Admin UUIDs should be kept confidential. Elections become locked after first vote is cast. Use secure URL sharing practices.',
      residualRisk: 'Low',
    },
    {
      threat: 'Supply Chain Attack',
      description: 'Compromised dependency in software supply chain',
      likelihood: 'Low',
      impact: 'Critical',
      mitigation:
        'All source code is open source and auditable. Use dependency scanning, regular updates, and review dependencies.',
      residualRisk: 'Low',
    },
    {
      threat: 'Voter Privacy Breach',
      description: 'Linking ballots back to voters through timing or other metadata',
      likelihood: 'Low',
      impact: 'High',
      mitigation:
        'Ballot-token association is permanently erased upon token redemption. No IP logging or tracking. Ballots are only revealed after election ends.',
      residualRisk: 'Low',
    },
    {
      threat: 'Result Manipulation',
      description: 'Someone tries to manipulate the election results',
      likelihood: 'Low',
      impact: 'Critical',
      mitigation:
        'All ballots are public after election ends. Anyone can verify the counting using the published algorithm. Results are auditable and reproducible.',
      residualRisk: 'Very Low',
    },
    {
      threat: 'Phishing Attacks',
      description: 'Attackers create fake voting sites to steal tokens or mislead voters',
      likelihood: 'Medium',
      impact: 'Medium',
      mitigation:
        'Electoral commission should educate voters about the official domain (stvote.eu). Use HTTPS with valid certificates. Voters should verify the URL before entering tokens.',
      residualRisk: 'Medium',
    },
    {
      threat: 'Client-Side Compromise',
      description: "Voter's device or browser is compromised (malware, malicious extensions)",
      likelihood: 'Low',
      impact: 'Low',
      mitigation:
        'Vote can only affect individual voter. No administrative access from client. Voters should use trusted devices and updated browsers. Consider using private/incognito mode.',
      residualRisk: 'Low',
    },
    {
      threat: 'Lost Token Access',
      description: 'Voter loses their ballot token before voting',
      likelihood: 'Medium',
      impact: 'Low',
      mitigation:
        'Electoral commission retains token list and can resend. Educate voters to store tokens securely. Tokens remain valid throughout voting period.',
      residualRisk: 'Very Low',
    },
    {
      threat: 'Timing Analysis',
      description: 'Observers correlate voting times with known voter activity',
      likelihood: 'Low',
      impact: 'Medium',
      mitigation:
        'Ballots only become public after election ends. No timestamps are exposed. Token redemption and ballot submission are separate events. Voters can redeem early and vote later.',
      residualRisk: 'Low',
    },
    {
      threat: 'Hosting Provider Access',
      description: 'Cloud/hosting provider personnel access system data',
      likelihood: 'Low',
      impact: 'High',
      mitigation:
        'Election results are publicly verifiable after closing. Database is encrypted at rest. For maximum security, organizations can self-host using open-source code.',
      residualRisk: 'Medium',
    },
  ];

  return (
    <Container maxWidth="lg">
      <SEO
        title="Risk Assessment - STVote.eu"
        description="Comprehensive risk assessment for the STVote electronic voting platform, including security threats, mitigations, and residual risks."
      />

      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          Risk Assessment
        </Typography>

        <Typography variant="body1" paragraph>
          This document provides a comprehensive risk assessment for the STVote.eu platform. It
          evaluates potential security threats, their likelihood and impact, implemented
          mitigations, and residual risks.
        </Typography>

        <Alert severity="warning">
          <AlertTitle>Scope of Use</AlertTitle>
          STVote.eu is designed for small to medium-scale elections where electronic voting is
          appropriate.
          <strong> Do not use this platform for high-stakes national elections</strong> where the
          risks require additional security measures such as physical voting, air-gapped systems, or
          formal security certifications.
        </Alert>

        <Paper>
          <Typography variant="h5" gutterBottom>
            Risk Assessment Methodology
          </Typography>
          <Typography variant="body2" paragraph>
            Risks are assessed based on:
          </Typography>
          <Box>
            <Typography variant="body2" component="div">
              <strong>Likelihood:</strong> Very Low, Low, Medium, High, Very High
            </Typography>
            <Typography variant="body2" component="div">
              <strong>Impact:</strong> Very Low, Low, Medium, High, Critical
            </Typography>
            <Typography variant="body2" component="div">
              <strong>Residual Risk:</strong> Risk remaining after mitigations are applied
            </Typography>
          </Box>
        </Paper>

        <Divider />

        <Typography variant="h5" gutterBottom>
          Identified Risks and Mitigations
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Threat</strong>
                </TableCell>
                <TableCell>
                  <strong>Description</strong>
                </TableCell>
                <TableCell>
                  <strong>Likelihood</strong>
                </TableCell>
                <TableCell>
                  <strong>Impact</strong>
                </TableCell>
                <TableCell>
                  <strong>Mitigation</strong>
                </TableCell>
                <TableCell>
                  <strong>Residual Risk</strong>
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

        <Divider />

        <Paper>
          <Typography variant="h5" gutterBottom>
            Security Architecture
          </Typography>

          <Typography variant="h6">Ballot Anonymization</Typography>
          <Typography variant="body2" paragraph>
            The core security feature is the permanent erasure of the ballot token-to-ballot UUID
            association. When a voter redeems their token, a new ballot UUID is generated and the
            link between the token and ballot is never stored. This ensures voter anonymity while
            maintaining ballot integrity.
          </Typography>

          <Typography variant="h6">No Authentication Required</Typography>
          <Typography variant="body2" paragraph>
            The system uses knowledge-based access control (UUID tokens) rather than traditional
            authentication. This eliminates the need for user accounts, passwords, or personal data
            collection, reducing both privacy risks and implementation complexity.
          </Typography>

          <Typography variant="h6">Public Auditability</Typography>
          <Typography variant="body2" paragraph>
            After an election ends, all ballots are made public. Anyone can verify the counting
            algorithm matches the published results. The complete source code for the counting
            algorithm, backend, frontend, and infrastructure is open source and auditable.
          </Typography>

          <Typography variant="h6">Single-Use Tokens</Typography>
          <Typography variant="body2" paragraph>
            Each ballot token can only be redeemed once and only during the voting period. Tokens
            cannot be redeemed after the election closes, preventing late manipulation attempts.
          </Typography>

          <Typography variant="h6">Election Locking</Typography>
          <Typography variant="body2" paragraph>
            Once the first vote is cast, an election becomes "locked" and its configuration
            (candidates, seats, times) cannot be modified. This prevents administrators from
            changing election parameters after voting has begun.
          </Typography>
        </Paper>

        <Paper>
          <Typography variant="h5" gutterBottom>
            Technical Security Measures
          </Typography>

          <Box>
            <Typography variant="body2" component="div">
              • <strong>Database:</strong> SQLite with file-system access controls
            </Typography>
            <Typography variant="body2" component="div">
              • <strong>Deployment:</strong> Docker containers running as non-root user (UID 1000)
            </Typography>
            <Typography variant="body2" component="div">
              • <strong>TLS/HTTPS:</strong> Automatic HTTPS via Caddy reverse proxy with Let's
              Encrypt
            </Typography>
            <Typography variant="body2" component="div">
              • <strong>Input Validation:</strong> All inputs validated for type safety and business
              logic
            </Typography>
            <Typography variant="body2" component="div">
              • <strong>Atomicity:</strong> Database transactions ensure consistency of critical
              operations
            </Typography>
            <Typography variant="body2" component="div">
              • <strong>Open Source:</strong> All code publicly available for security review
            </Typography>
          </Box>
        </Paper>

        <Paper>
          <Typography variant="h5" gutterBottom>
            Recommendations for Electoral Commissions
          </Typography>

          <Typography variant="body2" paragraph>
            To minimize risks, electoral commissions should:
          </Typography>

          <Box>
            <Typography variant="body2" component="div">
              1. <strong>Distribute tokens securely:</strong> Use encrypted channels (Signal, secure
              email) to send ballot tokens to voters
            </Typography>
            <Typography variant="body2" component="div">
              2. <strong>Keep admin UUIDs confidential:</strong> Only share admin URLs with trusted
              election administrators
            </Typography>
            <Typography variant="body2" component="div">
              3. <strong>Assess coercion risk:</strong> Consider if voters might face pressure to
              vote certain ways. If high, use physical voting instead
            </Typography>
            <Typography variant="body2" component="div">
              4. <strong>Communicate transparently:</strong> Inform voters about the security model
              and how their privacy is protected
            </Typography>
            <Typography variant="body2" component="div">
              5. <strong>Plan for contingencies:</strong> Have backup plans if technical issues
              occur during voting period
            </Typography>
            <Typography variant="body2" component="div">
              6. <strong>Verify results:</strong> Use the public ballot data to independently verify
              the counting algorithm
            </Typography>
            <Typography variant="body2" component="div">
              7. <strong>Self-hosting option:</strong> For maximum control and security, consider
              self-hosting using the open-source code
            </Typography>
          </Box>
        </Paper>

        <Alert severity="info">
          <AlertTitle>Open Source Transparency</AlertTitle>
          All source code is publicly available:
          <Box>
            <Typography variant="body2">
              • Backend:{' '}
              <a
                href="https://github.com/jorgecarleitao/stv-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/jorgecarleitao/stv-app
              </a>
            </Typography>
            <Typography variant="body2">
              • Frontend:{' '}
              <a
                href="https://github.com/jorgecarleitao/stv-app-frontend"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/jorgecarleitao/stv-app-frontend
              </a>
            </Typography>
            <Typography variant="body2">
              • Infrastructure:{' '}
              <a
                href="https://github.com/jorgecarleitao/stv-app-deploy"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/jorgecarleitao/stv-app-deploy
              </a>
            </Typography>
          </Box>
        </Alert>

        <Paper>
          <Typography variant="h5" gutterBottom>
            Conclusion
          </Typography>
          <Typography variant="body2" paragraph>
            STVote.eu provides a secure and transparent platform for running STV elections in
            contexts where electronic voting is appropriate. The system's security relies on
            cryptographic randomness (UUIDs), permanent anonymization of votes, public auditability,
            and open-source transparency.
          </Typography>
          <Typography variant="body2">
            The platform is suitable for community organizations, clubs, associations, and
            small-scale democratic processes. It is <strong>not suitable</strong> for high-stakes
            elections requiring additional security measures, formal certifications, or protection
            against nation-state level threats.
          </Typography>
        </Paper>

        <Typography variant="body2" color="text.secondary" align="center">
          Last updated: January 2026
        </Typography>
      </Box>
    </Container>
  );
}
