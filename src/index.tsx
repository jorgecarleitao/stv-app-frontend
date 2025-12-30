import { render } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import Router from 'preact-router';

import { createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@emotion/react';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

import './i18n';
import Home from './pages/home';
import Simulate from './pages/simulate';
import Footer from './footer';
import ElectionList from './pages/elections';
import ElectionDetail from './pages/election-detail';
import ElectionAdmin from './pages/election-admin';
import BallotPage from './pages/ballot';
import Navigation from './components/Navigation';

export default function App() {
	const { t, i18n } = useTranslation();
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');

	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: mode,
				},
			}),
		[mode],
	);

	const toggleTheme = () => {
		setMode(theme.palette.mode === 'dark' ? 'light' : 'dark');
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline enableColorScheme />
			<Box>
				<Navigation mode={mode} toggleTheme={toggleTheme} />
				<Box component="main" sx={{ p: 3 }}>
					<Toolbar />
					<Router>
						<Home path="/" />
						<Simulate path="/simulate" />
						<ElectionList path="/elections" />
						<ElectionAdmin path="/elections/create" />
						<ElectionDetail path="/elections/:electionId" />
						<ElectionAdmin path="/elections/:electionId/admin/:adminUuid" />
						<BallotPage path="/elections/:electionId/ballot/:ballotUuid" />
					</Router>
				</Box>
				<Footer />
			</Box>
		</ThemeProvider>
	);
}

render(<App />, document.getElementById('app'));
