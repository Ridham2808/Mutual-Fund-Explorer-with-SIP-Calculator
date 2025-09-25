"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

export const ColorModeContext = createContext({ mode: "light", toggle: () => {} });

export default function Providers({ children }) {
	const [mode, setMode] = useState("light");

	useEffect(() => {
		const saved = typeof window !== 'undefined' ? window.localStorage.getItem('mf_theme_mode') : null;
		if (saved === 'light' || saved === 'dark') setMode(saved);
	}, []);

	const value = useMemo(() => ({
		mode,
		toggle: () => setMode((m) => {
			const next = m === 'light' ? 'dark' : 'light';
			if (typeof window !== 'undefined') window.localStorage.setItem('mf_theme_mode', next);
			return next;
		}),
	}), [mode]);

	const theme = useMemo(() => createTheme({
		palette: {
			mode,
			primary: { main: mode === 'light' ? '#6366f1' : '#8b5cf6' },
			secondary: { main: mode === 'light' ? '#0ea5e9' : '#22d3ee' },
			background: { default: mode === 'light' ? '#f8fafc' : '#0b1020', paper: mode === 'light' ? '#ffffff' : '#0f172a' },
		},
		shape: { borderRadius: 14 },
		typography: { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' },
		components: {
			MuiCard: { styleOverrides: { root: { transition: 'transform .2s, box-shadow .2s' } } },
			MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 9999 } } },
		}
	}), [mode]);

	return (
		<ColorModeContext.Provider value={value}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ColorModeContext.Provider>
	);
}


