import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import ApiIcon from '@mui/icons-material/Api';
import DescriptionIcon from '@mui/icons-material/Description';

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        height: 'auto',
        py: 1,
        bgColor: 'dark',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            <Link
              href="/swagger-ui"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              color="textSecondary"
            >
              <ApiIcon fontSize="small" />
              <Typography variant="body2">API Documentation (Swagger UI)</Typography>
            </Link>
            <Link
              href="/api/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              color="textSecondary"
            >
              <DescriptionIcon fontSize="small" />
              <Typography variant="body2">OpenAPI Spec</Typography>
            </Link>
          </Stack>
          <Typography color="textSecondary" variant="subtitle1" align="center">
            © 2024 Jorge Leitão (<a href="https://www.linkedin.com/in/jorgecarleitao/">Linkedin</a>)
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
