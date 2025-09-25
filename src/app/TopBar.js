"use client";

import { useContext } from "react";
import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, IconButton, Tooltip } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from "./providers";

export default function TopBar() {
	const { mode, toggle } = useContext(ColorModeContext);
	return (
		<AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(6px)' }}>
			<Toolbar>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					MF Explorer
				</Typography>
				<Button component={Link} href="/" color="inherit">Home</Button>
				<Button component={Link} href="/funds" color="inherit">Funds</Button>
				<Button component={Link} href="/compare" color="inherit">Compare</Button>
				<Tooltip title={mode === 'light' ? 'Switch to dark' : 'Switch to light'}>
					<IconButton color="inherit" onClick={toggle} sx={{ ml: 1 }}>
						{mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
					</IconButton>
				</Tooltip>
			</Toolbar>
		</AppBar>
	);
}


