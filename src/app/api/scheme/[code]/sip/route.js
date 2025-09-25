import { NextResponse } from 'next/server';
import { getScheme, calcSip } from '@/lib/mfapi';

export async function POST(req, { params }) {
	try {
		const { code } = await params;
		const body = await req.json();
		const amount = Number(body.amount);
		const frequency = body.frequency || 'monthly';
		const from = body.from;
		const to = body.to;
		if (!amount || !from || !to) {
			return NextResponse.json({ error: 'amount, from, to required' }, { status: 400 });
		}
		const scheme = await getScheme(code);
		const navData = scheme.data;
		const result = calcSip({ amount, frequency, fromISO: from, toISO: to, navData });
		return NextResponse.json(result);
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 });
	}
}


