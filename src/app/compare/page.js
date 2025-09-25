"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Container, Grid, TextField, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

export default function ComparePage() {
	const [codes, setCodes] = useState("");
	const [schemes, setSchemes] = useState([]);

	useEffect(() => {
		(async () => {
			const res = await fetch('/api/mf');
			const j = await res.json();
			setSchemes(j.data ?? []);
		})();
	}, []);

	const parsed = useMemo(() => codes.split(',').map((c) => c.trim()).filter(Boolean).slice(0, 5), [codes]);
	const [series, setSeries] = useState([]);
	const [xAxis, setXAxis] = useState([]);

	async function runCompare() {
		const datasets = [];
		for (const code of parsed) {
			const res = await fetch(`/api/scheme/${code}`);
			const j = await res.json();
			const lastYear = (j.navs ?? []).slice(0, 365).map((r) => ({ date: r.date, nav: Number(r.nav) })).reverse();
			if (lastYear.length) datasets.push({ code, data: lastYear });
		}
		if (!datasets.length) return;
		const x = datasets[0].data.map((d) => d.date);
		setXAxis(x);
		const normSeries = datasets.map((ds) => ({
			label: ds.code,
			data: ds.data.map((d, i) => (ds.data[i].nav / ds.data[0].nav) * 100),
		}));
		setSeries(normSeries);
	}

	return (
		<Container sx={{ py: 3 }}>
			<Typography variant="h4" gutterBottom>Compare Schemes</Typography>
			<Typography variant="body2" color="text.secondary" gutterBottom>
				Enter up to 5 scheme codes separated by commas. We will normalize their last 1Y NAVs to 100 and compare growth.
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} md={8}>
					<TextField fullWidth placeholder="e.g. 118834, 100027" value={codes} onChange={(e) => setCodes(e.target.value)} />
				</Grid>
				<Grid item xs={12} md={4}>
					<Button variant="contained" fullWidth onClick={runCompare}>Compare</Button>
				</Grid>
			</Grid>

			<Card variant="outlined" sx={{ mt: 3 }}>
				<CardContent>
					<LineChart height={360} xAxis={[{ scaleType: 'point', data: xAxis }]} series={series} />
				</CardContent>
			</Card>

			<Box sx={{ mt: 2 }}>
				<Typography variant="subtitle2">Quick pick codes:</Typography>
				<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
					{schemes.slice(0, 20).map((s) => (
						<Button key={s.schemeCode} size="small" variant="outlined" onClick={() => setCodes((v) => (v ? `${v}, ${s.schemeCode}` : `${s.schemeCode}`))}>{s.schemeCode}</Button>
					))}
				</Box>
			</Box>
		</Container>
	);
}


