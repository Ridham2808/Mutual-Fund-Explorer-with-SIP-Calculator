import { NextResponse } from 'next/server';
import { getScheme, getNearestNavOnOrBefore, parseDate, formatISO } from '@/lib/mfapi';

export async function GET(req, { params }) {
	try {
		const { code } = await params;
		const { searchParams } = new URL(req.url);
		const amount = Number(searchParams.get('amount'));
		const on = searchParams.get('on'); // YYYY-MM-DD
		const to = searchParams.get('to'); // YYYY-MM-DD optional; default latest
		if (!amount || !on) return NextResponse.json({ error: 'amount and on required' }, { status: 400 });
		const scheme = await getScheme(code);
		const navs = scheme.data;
		const buyRow = getNearestNavOnOrBefore(on, navs);
		if (!buyRow) return NextResponse.json({ status: 'needs_review', reason: 'No NAV at or before buy date' }, { status: 422 });
		const sellRow = to ? (getNearestNavOnOrBefore(to, navs) || navs[0]) : navs[0];
		const buyDate = formatISO(parseDate(buyRow.date));
		const sellDate = formatISO(parseDate(sellRow.date));
		const buyNav = Number(buyRow.nav);
		const sellNav = Number(sellRow.nav);
		const units = amount / buyNav;
		const value = units * sellNav;
		const absolute = ((value - amount) / amount) * 100;
		const years = (new Date(sellDate) - new Date(buyDate)) / (1000 * 60 * 60 * 24 * 365.25);
		const annualized = years > 0 ? (Math.pow(value / amount, 1 / years) - 1) * 100 : null;
		return NextResponse.json({ buyDate, sellDate, buyNav, sellNav, units, invested: amount, value, absolute, annualized });
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 });
	}
}


