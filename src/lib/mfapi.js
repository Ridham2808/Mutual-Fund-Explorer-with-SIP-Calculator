import { getCache, setCache, TTL } from './cache';

const BASE_URL = 'https://api.mfapi.in';

async function fetchJson(url) {
	const res = await fetch(url, { next: { revalidate: 0 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch ${url}: ${res.status}`);
	}
	return res.json();
}

export async function getAllSchemes() {
	const cacheKey = 'mf_all_schemes_v1';
	const cached = getCache(cacheKey);
	if (cached) return cached;
	const data = await fetchJson(`${BASE_URL}/mf`);
	setCache(cacheKey, data, TTL.HOUR_24);
	return data;
}

export async function getScheme(code) {
	const cacheKey = `mf_scheme_${code}_v1`;
	const cached = getCache(cacheKey);
	if (cached) return cached;
	const data = await fetchJson(`${BASE_URL}/mf/${code}`);
	setCache(cacheKey, data, TTL.HOUR_12);
	return data;
}

export function parseDate(d) {
	// MFAPI date is in DD-MM-YYYY
	const [dd, mm, yyyy] = d.split('-').map(Number);
	return new Date(yyyy, mm - 1, dd);
}

export function formatISO(date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function getNearestNavOnOrBefore(targetISO, navData) {
	// navData: array of { date: 'DD-MM-YYYY', nav: '10.1234' } sorted desc by API
	const target = new Date(targetISO);
	let best = null;
	for (const row of navData) {
		const dt = parseDate(row.date);
		if (dt <= target) {
			best = row;
			break;
		}
	}
	return best;
}

export function computeSimpleAndAnnualized(startNav, endNav, startDateISO, endDateISO) {
	const start = Number(startNav);
	const end = Number(endNav);
	const simpleReturn = ((end - start) / start) * 100;
	const days = (new Date(endDateISO) - new Date(startDateISO)) / (1000 * 60 * 60 * 24);
	let annualizedReturn = null;
	if (days >= 30) {
		const years = days / 365.25;
		annualizedReturn = (Math.pow(end / start, 1 / years) - 1) * 100;
	}
	return { simpleReturn, annualizedReturn };
}

export function generateSipDates(fromISO, toISO, frequency = 'monthly') {
	const dates = [];
	const start = new Date(fromISO);
	const end = new Date(toISO);
	if (frequency !== 'monthly') throw new Error('Only monthly frequency supported');
	let dt = new Date(start.getFullYear(), start.getMonth(), start.getDate());
	while (dt <= end) {
		dates.push(formatISO(dt));
		dt = new Date(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
	}
	return dates;
}

export function calcSip({ amount, frequency, fromISO, toISO, navData }) {
	const sipDates = generateSipDates(fromISO, toISO, frequency);
	let totalUnits = 0;
	let totalInvested = 0;
	const timeline = [];
	for (const iso of sipDates) {
		const row = getNearestNavOnOrBefore(iso, navData);
		if (!row) continue;
		const nav = Number(row.nav);
		if (!isFinite(nav) || nav <= 0) continue;
		const units = amount / nav;
		totalUnits += units;
		totalInvested += amount;
		timeline.push({ date: iso, units, nav, cumulativeUnits: totalUnits, invested: totalInvested });
	}
	const latest = navData[0];
	const endNav = Number(latest?.nav ?? 0);
	const currentValue = totalUnits * endNav;
	const absoluteReturn = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
	const years = (new Date(navData[0] ? parseDate(navData[0].date) : new Date()) - new Date(fromISO)) / (1000 * 60 * 60 * 24 * 365.25);
	const annualizedReturn = totalInvested > 0 && years > 0 ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100 : null;
	return { sipDates, totalUnits, totalInvested, currentValue, absoluteReturn, annualizedReturn, endNav, timeline };
}


