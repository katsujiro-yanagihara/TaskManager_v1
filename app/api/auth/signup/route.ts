import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // サインアップのロジック
  return NextResponse.json({ message: 'Success' });
}