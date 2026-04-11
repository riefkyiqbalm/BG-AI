import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// GET: Mengambil semua daftar sesi untuk Sidebar
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);
    const userId = getUserFromToken(token as string);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Membuat sesi chat baru (tombol New Chat)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);
    const userId = getUserFromToken(token as string);

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const newSession = await prisma.chatSession.create({
      data: {
        userId: userId,
        title: "New Chat", 
      }
    });

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error: any) {
    console.error("PRISMA ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}