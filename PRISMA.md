# Using Prisma in BG-AI Next.js Project

This guide explains how to use Prisma for database operations in the BG-AI Next.js application.

## Overview

Prisma is an ORM that provides type-safe database access. This project uses Prisma with PostgreSQL to manage user authentication and chat sessions.

## Database Configuration

The database is configured in `prisma/schema.prisma`:

- **Provider**: PostgreSQL
- **Database**: `bgaidatabase`
- **User**: `postgres`
- **Password**: `admin` (configured in `.env`)

## Schema Models

### User Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  chatSessions ChatSession[]
}
```

### ChatSession Model
```prisma
model ChatSession {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String?
  messages  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Setup Commands

### Generate Prisma Client
After schema changes, regenerate the client:
```bash
npx prisma generate
```

### Database Migration
To apply schema changes to the database:
```bash
npx prisma db push
```

### View Database
To explore the database:
```bash
npx prisma studio
```

## Using Prisma in Code

### Import the Client
```typescript
import { prisma } from '@/lib/prisma'
```

### Create a User
```typescript
const user = await prisma.user.create({
  data: {
    username: 'example',
    password: 'hashedpassword'
  }
})
```

### Find a User
```typescript
const user = await prisma.user.findUnique({
  where: { username: 'example' }
})
```

### Create a Chat Session
```typescript
const session = await prisma.chatSession.create({
  data: {
    userId: user.id,
    title: 'New Chat'
  }
})
```

### Get User's Chat Sessions
```typescript
const sessions = await prisma.chatSession.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' }
})
```

### Update Chat Messages
```typescript
await prisma.chatSession.update({
  where: { id: session.id },
  data: {
    messages: { /* JSON data */ },
    updatedAt: new Date()
  }
})
```

## API Routes

The following API routes use Prisma:

- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/chat/sessions` - Get user's chat sessions
- `POST /api/chat/sessions` - Create new chat session

## Environment Variables

Ensure `.env` contains:
```
DATABASE_URL="postgresql://postgres:admin@localhost:5432/bgaidatabase"
JWT_SECRET="your-secret-key"
```

## Best Practices

- Always use the Prisma client instance from `@/lib/prisma`
- Handle database errors appropriately
- Use transactions for multiple related operations
- Keep schema changes minimal and tested

## Troubleshooting

- If schema changes don't apply, run `npx prisma db push`
- For connection issues, verify PostgreSQL is running and credentials are correct
- Use `npx prisma studio` to inspect data directly

## Hosting the Database

### Local Development
1. **Install PostgreSQL**: Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. **Start PostgreSQL Service** (Windows):
   - Open Services (services.msc) or PowerShell as Administrator
   - Find the service named `postgresql-x64-XX` (where XX is the version, e.g., 18)
   - Right-click and select "Start" if not running
   - Or use PowerShell: `Start-Service -Name "postgresql-x64-XX"`
3. **Verify Service Status**:
   ```powershell
   Get-Service -Name "*postgresql*" | Select-Object Name, Status
   ```
4. **Create Database**: Use pgAdmin (installed with PostgreSQL) or command line:
   ```bash
   createdb -U postgres bgaidatabase
   ```
5. **Set Credentials**: Ensure the user `postgres` has password `admin` and access to the database

### Test Database Connection
```bash
# Set password environment variable
$env:PGPASSWORD="admin"
# Connect to database
psql -U postgres -d bgaidatabase -c "SELECT version();"
```

### Production Hosting Options
- **AWS RDS**: Set up a PostgreSQL instance on Amazon RDS
- **Google Cloud SQL**: Use Google Cloud's managed PostgreSQL
- **Heroku Postgres**: Add Heroku Postgres addon to your Heroku app
- **Supabase**: Use Supabase for a managed PostgreSQL with additional features
- **Railway**: Deploy PostgreSQL database with Railway

### Environment Variables for Production
Update your production `.env` or environment variables:
```
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-production-secret"
```

## Running the Application

### Development Mode
1. **Ensure Database is Running**: Make sure PostgreSQL is started and the database is accessible
2. **Install Dependencies**: Run `npm install` in the `ui` directory
3. **Start Development Server**: Run `npm run dev`
   ```bash
   cd ui
   npm run dev
   ```
4. **Access Application**: Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build
1. **Build the Application**: Run `npm run build`
2. **Start Production Server**: Run `npm start`
   ```bash
   npm run build
   npm start
   ```

### Prerequisites
- Node.js 18+ installed
- PostgreSQL running and configured
- All environment variables set in `.env` file

### Common Issues
- **Database Connection Error**: Verify DATABASE_URL and ensure PostgreSQL is running
- **Port Already in Use**: Change the port in `package.json` or kill the process using the port
- **Missing Dependencies**: Run `npm install` to install all required packages