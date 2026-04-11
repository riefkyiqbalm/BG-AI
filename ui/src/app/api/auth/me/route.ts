import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client/extension';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;   // ← Ambil dari cookie

    if (!token) {
      return NextResponse.json({ error: 'Akses tidak sah' }, { status: 401 });
    }

    const userId = getUserFromToken(token);   // fungsi kamu tetap dipakai

    if (!userId) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }


    const user = await prisma.user.findUnique({ where: { id: userId }, select: {
    id: true,
    name: true,
    email: true,
    role: true,        // 
    contact: true,     // 
    institution: true, //
  } });
    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.name,
      email: user.email,
      contact: user.contact || '',
      institution: user.institution || '',
      role: user.role || '',
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('[API /auth/me] ', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;   // ← Ambil dari cookie

    if (!token) {
      return NextResponse.json({ error: 'Akses tidak sah' }, { status: 401 });
    }

    const userId = getUserFromToken(token);   // fungsi kamu tetap dipakai

    if (!userId) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }
    const body = await req.json();
    const { contact, institution, role } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      select: {
       id: true,
    name: true,
    email: true,
    role: true,        // 
    contact: true,     // 
    institution: true, //
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      contact: updatedUser.contact || '',
      institution: updatedUser.institution || '',
      role: updatedUser.role || '',
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error('[API /auth/me PUT] ', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}