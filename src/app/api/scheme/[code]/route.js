import { NextResponse } from 'next/server';
import { getScheme } from '@/lib/mfapi';

export async function GET(_req, { params }) {
	try {
		const { code } = await params;
		const data = await getScheme(code);
		const { meta, data: navs } = data;
		return NextResponse.json({ meta, navs });
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}


