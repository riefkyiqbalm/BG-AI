import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export const maxDuration = 300; // Timeout 5 menit untuk nunggu respon Flask

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Cek Auth
    const { id: sessionId } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);
    const userId = getUserFromToken(token as string);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Ambil Pesan dari Frontend
    const { message } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    // 3. Simpan Pesan User ke DB
    await prisma.message.create({
      data: { text: message, role: 'user', sessionId }
    });

    // 4. Teruskan ke Flask (Sesuaikan URL jika Flask di-deploy)
    const flaskRes = await fetch("http://127.0.0.1:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: message }] }),
    });

    if (!flaskRes.ok) {
      const errText = await flaskRes.text();
      throw new Error(`Flask Error: ${errText}`);
    }

    const aiData = await flaskRes.json();
    const aiText = aiData.choices[0].message.content; // Sesuaikan dengan response format Flask Anda

    // 5. Simpan Balasan AI ke DB
    const savedAiMsg = await prisma.message.create({
      data: { text: aiText, role: 'assistant', sessionId }
    });

    return NextResponse.json({ response: savedAiMsg });

  } catch (error: any) {
    console.error("[Message Bridge Error]:", error);
    return NextResponse.json({ error: error.message || 'AI Service Error' }, { status: 500 });
  }
}