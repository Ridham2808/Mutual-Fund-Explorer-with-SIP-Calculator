"use client";

import { useEffect, useMemo, useState } from "react";
import {
	Box,
	Container,
	Typography,
	TextField,
	Grid,
	Card,
	CardContent,
	Chip,
	InputAdornment,
	Tabs,
	Tab,
} from "@mui/material";
import Link from "next/link";

export default function FundsPage() {
	const [schemes, setSchemes] = useState([]);
	const [query, setQuery] = useState("");
	const [activeTab, setActiveTab] = useState(0);

	useEffect(() => {
		(async () => {
			const res = await fetch("/api/mf");
			const json = await res.json();
			setSchemes(json.data ?? []);
		})();
	}, []);

	const grouped = useMemo(() => {
		const byHouse = new Map();
		for (const s of schemes) {
			const house = s?.amc || s?.fund_house || "Unknown";
			if (!byHouse.has(house)) byHouse.set(house, []);
			byHouse.get(house).push(s);
		}
		return Array.from(byHouse.entries()).map(([house, list]) => ({ house, list }));
	}, [schemes]);

	const filtered = useMemo(() => {
		if (!query) return grouped;
		const q = query.toLowerCase();
		return grouped
			.map(({ house, list }) => ({
				house,
				list: list.filter((s) => s.schemeName?.toLowerCase().includes(q)),
			}))
			.filter((g) => g.list.length > 0);
	}, [grouped, query]);

	return (
		<Container sx={{ py: 3 }}>
			<Typography variant="h4" gutterBottom>Mutual Funds</Typography>
			<TextField
				fullWidth
				placeholder="Search scheme name"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				margin="normal"
				InputProps={{
					startAdornment: <InputAdornment position="start">🔎</InputAdornment>,
				}}
			/>
			<Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
				<Tab label="By Fund House" />
				<Tab label="All Schemes" />
			</Tabs>

			{activeTab === 0 && (
				<Box sx={{ display: "grid", gap: 3 }}>
					{filtered.map(({ house, list }) => (
						<Box key={house}>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
								<Typography variant="h6">{house}</Typography>
								<Chip label={`${list.length} schemes`} size="small" />
							</Box>
							<Grid container spacing={2}>
								{list.map((s) => (
									<Grid key={s.schemeCode} item xs={12} sm={6} md={4}>
										<Link href={`/scheme/${s.schemeCode}`} style={{ textDecoration: "none" }}>
											<Card variant="outlined" sx={{ transition: 'transform .25s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
												<CardContent>
													<Typography variant="subtitle1" gutterBottom>{s.schemeName}</Typography>
													<Typography variant="body2" color="text.secondary">Code: {s.schemeCode}</Typography>
												</CardContent>
											</Card>
										</Link>
									</Grid>
								))}
							</Grid>
						</Box>
					))}
				</Box>
			)}

			{activeTab === 1 && (
				<Grid container spacing={2}>
					{(query ? filtered.flatMap((g) => g.list) : schemes).slice(0, 300).map((s) => (
						<Grid key={s.schemeCode} item xs={12} sm={6} md={4}>
							<Link href={`/scheme/${s.schemeCode}`} style={{ textDecoration: "none" }}>
											<Card variant="outlined" sx={{ transition: 'transform .25s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
									<CardContent>
										<Typography variant="subtitle1" gutterBottom>{s.schemeName}</Typography>
										<Typography variant="body2" color="text.secondary">Code: {s.schemeCode}</Typography>
									</CardContent>
								</Card>
							</Link>
						</Grid>
					))}
				</Grid>
			)}
		</Container>
	);
}


