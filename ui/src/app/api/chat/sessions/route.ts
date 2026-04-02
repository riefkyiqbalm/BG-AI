import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// Timeout konfigurasi untuk Next.js (300 detik = 5 menit)
export const maxDuration = 300; 

export async function POST(request: NextRequest) {
  try {
    // 1. Cek Autentikasi
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const userId = getUserFromToken(token)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 2. Ambil Body dari Frontend
    const body = await request.json()
    
    /* Logika Ganda: 
      Jika ada 'messages', berarti ini mau CHAT ke AI.
      Jika hanya ada 'title', berarti ini mau BUAT SESSION BARU.
    */

    if (body.messages) {
      console.log("[Proxy] Meneruskan pesan ke Flask...");
      
      // KIRIM KE FLASK (Port 5000)
      const flaskResponse = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!flaskResponse.ok) {
        const errorText = await flaskResponse.text();
        return NextResponse.json({ error: `Flask Error: ${errorText}` }, { status: 500 });
      }

      const aiData = await flaskResponse.json();
      return NextResponse.json(aiData);
    } 
    
    // Logika asal kamu: Membuat Chat Session di Prisma
    if (body.title) {
      const session = await prisma.chatSession.create({
        data: { userId, title: body.title }
      })
      return NextResponse.json({ session })
    }

    return NextResponse.json({ error: "Invalid Request Body" }, { status: 400 });

  } catch (error: any) {
    console.error("[API Route Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handler GET tetap sama untuk mengambil history
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.substring(7)
  const userId = getUserFromToken(token)
  
  if (!userId) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const sessions = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json({ sessions })
}