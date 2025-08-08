import { render } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import locale from 'locale-code';

import { createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@emotion/react';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import { Tab } from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Drawer from '@mui/material/Drawer';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import './i18n';
import Home from './pages/home'
import Footer from './footer';
import Methodology from './pages/methodology';

type Tab = "introduction"

const drawerWidth = 240;

export default function App() {
	const { t, i18n } = useTranslation();
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const [mobileOpen, setMobileOpen] = useState(false);

	const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');

	const [tab, setTab] = useState<Tab>("introduction");

	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: mode,
				},
			}),
		[mode],
	);

	const NAMES = {
		"introduction": t("Introduction"),
		"methodology": t("Methodology"),
	}

	const DESCRIPTIONS = {
		"introduction": t("Introduction"),
		"methodology": t("Methodology"),
	}

	const handleDrawerToggle = () => {
		setMobileOpen(prevState => !prevState);
	};

	const drawer = (
		<Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
			<Typography variant="h6" sx={{ my: 2 }}>
				{t("STV election runner")}
			</Typography>
			<Divider />
			<List>
				{Object.entries(NAMES).map(([page, title]) => (
					<ListItem key={page} disablePadding>
						<Tooltip title={DESCRIPTIONS[page]}>
							<ListItemButton sx={{ textAlign: 'center' }} onClick={(_) => setTab(page as Tab)}>
								<ListItemText primary={title} />
							</ListItemButton>
						</Tooltip>
					</ListItem>

				))}
			</List>
		</Box >
	);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline enableColorScheme />
			<Box>
				<AppBar component="nav">
					<Toolbar>
						<IconButton
							color="inherit"
							aria-label="open drawer"
							edge="start"
							onClick={handleDrawerToggle}
							sx={{ mr: 2, display: { sm: 'none' } }}
						>
							<MenuIcon />
						</IconButton>
						<Typography
							variant="h6"
							component="div"
							sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
						>
							{t("STV election runner")}
						</Typography>
						<Box sx={{ display: { xs: 'none', sm: 'block' } }}>
							{Object.entries(NAMES).map(([page, title]) => (
								<Tooltip title={DESCRIPTIONS[page]}>
									<Button
										sx={{ ml: 1 }}
										key={page}
										onClick={(_) => setTab(page as Tab)}
										color="inherit"
									>
										{title}
									</Button>
								</Tooltip>
							))}
						</Box>
						<IconButton sx={{ ml: 1 }} onClick={() => setMode(theme.palette.mode == 'dark' ? 'light' : 'dark')} color="inherit">
							{theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
						</IconButton>
						<Select
							variant="standard"
							value={i18n.language}
							onChange={(e) => i18n.changeLanguage(e.target.value)}
							sx={{ ml: 2, color: 'inherit' }}
						>
							{Object.keys(i18n.options.resources).map(lang => (
								<MenuItem key={lang} value={lang}>
									{locale.getLanguageNativeName(lang)}
								</MenuItem>
							))}
						</Select>
					</Toolbar>
				</AppBar>
				<nav>
					<Drawer
						variant="temporary"
						open={mobileOpen}
						onClose={handleDrawerToggle}
						ModalProps={{
							keepMounted: true,
						}}
						sx={{
							display: { xs: 'block', sm: 'none' },
							'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
						}}
					>
						{drawer}
					</Drawer>
				</nav>
				<Box component="main" sx={{ p: 3 }}>
					<Toolbar />
					<Main tab={tab} />
				</Box>
				<Footer />
			</Box>
		</ThemeProvider>
	);
}

export function Main({ tab }: { tab: Tab }) {
	return {
		"introduction": () => <Home />,
		"methodology": () => <Methodology />,
	}[tab]()
}

render(<App />, document.getElementById('app'));
