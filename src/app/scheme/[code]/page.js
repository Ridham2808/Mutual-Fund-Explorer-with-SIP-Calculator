"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
	Box,
	Container,
	Typography,
	Grid,
	Card,
	CardContent,
	Divider,
	TextField,
	Button,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { Tabs, Tab, Chip } from "@mui/material";

function toISO(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

export default function SchemePage() {
	const { code } = useParams();
	const validCode = typeof code === "string" && code !== "[code]" && code.length > 0;
	const [meta, setMeta] = useState(null);
	const [navs, setNavs] = useState([]);
	const [returnsData, setReturnsData] = useState(null);
	const [sipForm, setSipForm] = useState(() => {
		const now = new Date();
		const from = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
		return { amount: 5000, frequency: "monthly", from: toISO(from), to: toISO(now) };
	});
	const [sipResult, setSipResult] = useState(null);
	const [tab, setTab] = useState(0);
	const [lump, setLump] = useState({ amount: 50000, on: toISO(new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate())), to: toISO(new Date()) });
	const [lumpResult, setLumpResult] = useState(null);

	useEffect(() => {
		if (!validCode) return;
		(async () => {
			const res = await fetch(`/api/scheme/${code}`);
			const j = await res.json();
			setMeta(j.meta);
			setNavs(j.navs ?? []);
		})();
	}, [code, validCode]);

	useEffect(() => {
		if (!validCode) return;
		(async () => {
			const res = await fetch(`/api/scheme/${code}/returns?period=1y`);
			setReturnsData(await res.json());
		})();
	}, [code, validCode]);

	const lastYear = useMemo(() => {
		if (!navs.length) return [];
		// API returns desc; take ~365 entries
		const slice = navs.slice(0, 365).map((r) => ({
			date: r.date,
			nav: Number(r.nav),
		}));
		return slice.reverse();
	}, [navs]);

	async function onCalcSip() {
		if (!validCode) return;
		const res = await fetch(`/api/scheme/${code}/sip`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(sipForm),
		});
		const j = await res.json();
		setSipResult(j);
	}

	const sipGrowthSeries = useMemo(() => {
		if (!sipResult || !navs.length) return [];
		// Build growth over time using timeline and end NAV
		const endNav = sipResult.endNav ?? Number(navs[0]?.nav ?? 0);
		return (sipResult.timeline ?? []).map((t) => ({
			date: t.date,
			value: t.cumulativeUnits * endNav,
		}));
	}, [sipResult, navs]);

	return (
		<Container sx={{ py: 3 }}>
		<Typography variant="h4" gutterBottom>{meta?.scheme_name || (validCode ? `Scheme ${code}` : "Scheme")}</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={8}>
					<Card variant="outlined" sx={{ transition: 'transform .25s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
						<CardContent>
							<Typography variant="h6" gutterBottom>NAV History (1Y)</Typography>
							<LineChart
								height={300}
								xAxis={[{ scaleType: "point", data: lastYear.map((d) => d.date) }]}
								series={[{ data: lastYear.map((d) => d.nav), label: "NAV" }]}
							/>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={4}>
					<Card variant="outlined" sx={{ transition: 'transform .25s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
						<CardContent>
							<Typography variant="h6">Details</Typography>
							<Divider sx={{ my: 1 }} />
							<Typography variant="body2">Fund House: {meta?.fund_house}</Typography>
							<Typography variant="body2">Category: {meta?.category}</Typography>
							<Typography variant="body2">ISIN: {meta?.isin || meta?.isin_growth || meta?.isin_dividend || "-"}</Typography>
							<Divider sx={{ my: 2 }} />
							<Typography variant="subtitle2">Returns</Typography>
							{returnsData && (
								<Box sx={{ mt: 1 }}>
									<Chip size="small" label={`1Y Simple: ${returnsData.simpleReturn?.toFixed?.(2)}%`} sx={{ mr: 1 }} />
									<Chip size="small" label={`1Y Annualized: ${returnsData.annualizedReturn?.toFixed?.(2)}%`} />
								</Box>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			<Grid container spacing={3} sx={{ mt: 2 }}>
				<Grid item xs={12} md={5}>
					<Card variant="outlined" sx={{ transition: 'transform .25s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
						<CardContent>
							<Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
								<Tab label="SIP" />
								<Tab label="Lumpsum" />
							</Tabs>
							{tab === 0 && (
								<>
									<Typography variant="h6" gutterBottom>SIP Calculator</Typography>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<TextField type="number" label="Amount" fullWidth value={sipForm.amount} onChange={(e) => setSipForm({ ...sipForm, amount: Number(e.target.value) })} />
								</Grid>
								<Grid item xs={12}>
									<TextField type="date" label="From" fullWidth InputLabelProps={{ shrink: true }} value={sipForm.from} onChange={(e) => setSipForm({ ...sipForm, from: e.target.value })} />
								</Grid>
								<Grid item xs={12}>
									<TextField type="date" label="To" fullWidth InputLabelProps={{ shrink: true }} value={sipForm.to} onChange={(e) => setSipForm({ ...sipForm, to: e.target.value })} />
								</Grid>
								<Grid item xs={12}>
									<Button variant="contained" onClick={onCalcSip}>Calculate Returns</Button>
								</Grid>
							</Grid>
								</>
							)}
							{tab === 1 && (
								<>
									<Typography variant="h6" gutterBottom>Lumpsum Calculator</Typography>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<TextField type="number" label="Amount" fullWidth value={lump.amount} onChange={(e) => setLump({ ...lump, amount: Number(e.target.value) })} />
										</Grid>
										<Grid item xs={12}>
											<TextField type="date" label="Buy On" fullWidth InputLabelProps={{ shrink: true }} value={lump.on} onChange={(e) => setLump({ ...lump, on: e.target.value })} />
										</Grid>
										<Grid item xs={12}>
											<TextField type="date" label="Sell On" fullWidth InputLabelProps={{ shrink: true }} value={lump.to} onChange={(e) => setLump({ ...lump, to: e.target.value })} />
										</Grid>
										<Grid item xs={12}>
											<Button variant="contained" onClick={async () => {
												const res = await fetch(`/api/scheme/${code}/lumpsum?amount=${lump.amount}&on=${lump.on}&to=${lump.to}`);
												const j = await res.json();
												setLumpResult(j);
											}}>Calculate</Button>
										</Grid>
									</Grid>
								</>
							)}
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={7}>
					<Card variant="outlined" sx={{ transition: 'transform .2s', '&:hover': { transform: 'translateY(-2px)' } }}>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<Typography variant="h6" gutterBottom>SIP Growth</Typography>
								{meta?.fund_house && <Chip size="small" label={meta.fund_house} />}
							</Box>
							{(tab === 0 ? sipResult : lumpResult) && (
								<Box sx={{ mb: 2 }}>
									{tab === 0 ? (
										<>
											<Typography variant="body2">Total Invested: ₹{sipResult.totalInvested?.toFixed?.(2)}</Typography>
											<Typography variant="body2">Current Value: ₹{sipResult.currentValue?.toFixed?.(2)}</Typography>
											<Typography variant="body2">Absolute Return: {sipResult.absoluteReturn?.toFixed?.(2)}%</Typography>
											<Typography variant="body2">Annualized Return: {sipResult.annualizedReturn != null ? sipResult.annualizedReturn.toFixed(2) : "-"}%</Typography>
										</>
									) : (
										<>
											<Typography variant="body2">Invested: ₹{lumpResult.invested?.toFixed?.(2)}</Typography>
											<Typography variant="body2">Current Value: ₹{lumpResult.value?.toFixed?.(2)}</Typography>
											<Typography variant="body2">Absolute Return: {lumpResult.absolute?.toFixed?.(2)}%</Typography>
											<Typography variant="body2">Annualized Return: {lumpResult.annualized != null ? lumpResult.annualized.toFixed(2) : "-"}%</Typography>
										</>
									)}
								</Box>
							)}
							<LineChart
								height={300}
								xAxis={[{ scaleType: "point", data: (tab === 0 ? sipGrowthSeries.map((d) => d.date) : (lumpResult ? [lumpResult.buyDate, lumpResult.sellDate] : [])) }]}
								series={[{ data: (tab === 0 ? sipGrowthSeries.map((d) => d.value) : (lumpResult ? [lumpResult.invested, lumpResult.value] : [])), label: "Value" }]}
							/>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Container>
	);
}


