import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        height: 'auto',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        bgColor: 'dark',
      }}
    >
      <Container maxWidth="lg">
        <Typography color="textSecondary" variant="subtitle1" align="center">
          © 2024 Jorge Leitão (
          <a href="https://www.linkedin.com/in/jorgecarleitao/">Linkedin</a>)
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
