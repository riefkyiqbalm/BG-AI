import jwt from 'jsonwebtoken'

export function getUserFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}