import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    // 1. Ambil data (tambahkan pengecekan apakah body ada isi)
    const body = await req.json().catch(() => ({}));
    const { email, password, username } = body;

    // 2. Validasi Data Lengkap
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Registrasi gagal: Email, password, dan username wajib diisi.' }, 
        { status: 400 }
      );
    }

    // 3. Cek user eksis (Gunakan operator OR agar mencegat salah satu yang kembar)
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (userExists) {
      const field = userExists.email === email ? 'Email' : 'Username';
      return NextResponse.json(
        { error: `${field} sudah terdaftar, silakan gunakan yang lain.` }, 
        { status: 400 }
      );
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Simpan ke Database
    const newUser = await prisma.user.create({
      data: { 
        email, 
        username, 
        password: hashedPassword 
      }
    });

    // 6. Respon Berhasil
    return NextResponse.json({ 
      message: 'Registrasi berhasil', 
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        username: newUser.username 
      } 
    }, { status: 201 });

  } catch (err: any) {
    console.error("[REGISTER_ERROR]:", err.message);
    
    // Cegah crash jika ada error unik dari database yang lolos dari pengecekan di atas
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email atau Username sudah digunakan.' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}