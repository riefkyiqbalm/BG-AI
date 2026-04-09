import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.substring(7)
  const userId = getUserFromToken(token)
  if (!userId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const sessionId = id
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId }
  })

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json({ session })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.substring(7)
  const userId = getUserFromToken(token)
  if (!userId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const sessionId = id
  const { title } = await request.json()

  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId }
  })

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const updatedSession = await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      ...(title && { title })
    }
  })

  return NextResponse.json({ session: updatedSession })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.substring(7)
  const userId = getUserFromToken(token)
  if (!userId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const sessionId = id
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId }
  })

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  await prisma.chatSession.delete({
    where: { id: sessionId }
  })

  return NextResponse.json({ success: true })
}