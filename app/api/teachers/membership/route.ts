import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
	return NextResponse.json(
		{ error: 'Teacher access requires explicit administrator approval.' },
		{ status: 403 },
	);
}