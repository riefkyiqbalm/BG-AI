import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);
    const userId = getUserFromToken(token as string);
    
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title } = await request.json();

    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { ...(title && { title }) }
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);
    const userId = getUserFromToken(token as string);
    
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await prisma.chatSession.delete({ where: { id: sessionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}