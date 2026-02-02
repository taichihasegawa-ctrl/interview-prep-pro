import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ generations: [] });
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ success: true });
}
