import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // 1. Cek user eksis
    const userExists = await prisma.user.findUnique({ where: { username } });
    if (userExists) {
      return NextResponse.json({ error: 'Username sudah terdaftar' }, { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan ke Database
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword }
    });

    // WAJIB: Balikkan JSON agar frontend tidak error
    return NextResponse.json({ 
      message: 'Registrasi berhasil', 
      user: { id: newUser.id, username: newUser.username } 
    }, { status: 201 });

  } catch (err) {
    console.error(err);
    // Jika crash, tetap kirim JSON error
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}