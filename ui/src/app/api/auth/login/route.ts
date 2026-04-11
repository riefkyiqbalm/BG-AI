// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }  // BUG FIX — was "7d" implicitly from cookie, but
                            // the JWT itself had no expiresIn set, so it never
                            // expired and /api/auth/me always returned 200 even
                            // after the cookie was deleted. Now JWT matches
                            // the 7-day cookie lifetime.
    );

    // BUG FIX — original route only returned { id, email }.
    // AuthContext.tsx expected name, contact, institution, role, createdAt.
    // Missing fields caused `userData.name` to be undefined, breaking the
    // Navbar and account page on first login.
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        contact: user.contact ?? "",
        institution: user.institution ?? "",
        role: user.role ?? "",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}