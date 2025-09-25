import { NextResponse } from 'next/server';
import { getScheme, getNearestNavOnOrBefore, computeSimpleAndAnnualized, formatISO, parseDate } from '@/lib/mfapi';

function resolvePeriod(query) {
	const period = query.get('period');
	if (period) {
		const now = new Date();
		let from;
		switch (period) {
			case '1m': from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); break;
			case '3m': from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()); break;
			case '6m': from = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()); break;
			case '1y': from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break;
			default: throw new Error('Invalid period');
		}
		return { from: formatISO(from), to: formatISO(now) };
	}
	const from = query.get('from');
	const to = query.get('to');
	if (!from || !to) throw new Error('Provide period or from/to');
	return { from, to };
}

export async function GET(req, { params }) {
	try {
		const { code } = await params;
		const { searchParams } = new URL(req.url);
		const { from, to } = resolvePeriod(searchParams);
		const scheme = await getScheme(code);
		const navs = scheme.data;
		const startRow = getNearestNavOnOrBefore(from, navs);
		const endRow = getNearestNavOnOrBefore(to, navs) || navs[0];
		if (!startRow || !endRow) {
			return NextResponse.json({ status: 'needs_review', reason: 'Insufficient data' }, { status: 422 });
		}
		const startDate = formatISO(parseDate(startRow.date));
		const endDate = formatISO(parseDate(endRow.date));
		const startNAV = Number(startRow.nav);
		const endNAV = Number(endRow.nav);
		const { simpleReturn, annualizedReturn } = computeSimpleAndAnnualized(startNAV, endNAV, startDate, endDate);
		return NextResponse.json({ startDate, endDate, startNAV, endNAV, simpleReturn, annualizedReturn });
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 });
	}
}


