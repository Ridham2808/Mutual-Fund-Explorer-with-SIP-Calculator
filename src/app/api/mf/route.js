import { NextResponse } from 'next/server';
import { getAllSchemes } from '@/lib/mfapi';

export async function GET() {
	try {
		const data = await getAllSchemes();
		return NextResponse.json({ count: data.length, data });
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}


