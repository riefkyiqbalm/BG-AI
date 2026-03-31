# Database & Forms Integration Guide

This guide explains how to use the database and form components in the BG-AI Next.js application.

## Quick Start

### 1. Initialize the Database

First, set up the database with tables and a test user:

```bash
npm run db:init
```

This creates:
- User and ChatSession tables
- Test user: `testuser` / `password123`
- Default chat session for testing

### 2. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Components

### LoginForm Component

Login form that authenticates users against the database.

**Location**: `src/components/LoginForm.tsx`

**Usage**:
```tsx
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return <LoginForm />
}
```

**Features**:
- Username and password input fields
- Client-side validation
- Error handling
- Uses `/api/auth/login` endpoint
- Stores JWT token in localStorage

### RegisterForm Component

Registration form for creating new user accounts.

**Location**: `src/components/RegisterForm.tsx`

**Usage**:
```tsx
import RegisterForm from '@/components/RegisterForm'

export default function RegisterPage() {
  return <RegisterForm />
}
```

**Features**:
- Username, password, and confirm password inputs
- Password validation (minimum 6 characters)
- Password match verification
- Auto-login after successful registration
- Uses `/api/auth/register` endpoint

### ChatInput Component

Form component for sending chat messages that are saved to the database.

**Location**: `src/components/ChatInput.tsx`

**Usage**:
```tsx
import ChatInput from '@/components/ChatInput'
import { useState } from 'react'

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<number | undefined>(1)

  return (
    <ChatInput
      sessionId={sessionId}
      onMessageSent={(message) => {
        console.log('Message sent:', message)
      }}
    />
  )
}
```

**Props**:
- `sessionId` (optional): ID of the chat session to save messages to
- `onMessageSent` (optional): Callback when a message is successfully sent

**Features**:
- Message input field
- Authentication check before sending
- Saves messages to database
- Error handling
- Shows loading state

## Authentication Flow

### Registration Flow

1. User enters username and password in `RegisterForm`
2. Form validates inputs (min 6 chars, passwords match)
3. POST request to `/api/auth/register`
4. Server creates hashed password with bcrypt
5. User record created in database
6. Auto-login triggered
7. JWT token stored in localStorage
8. User redirected to app

### Login Flow

1. User enters username and password in `LoginForm`
2. POST request to `/api/auth/login`
3. Server validates credentials against stored hash
4. JWT token generated and sent to client
5. Token stored in localStorage
6. User object stored in AuthContext
7. Components can access user via `useAuth()` hook

## Database Schema

### User Table

```sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### ChatSession Table

```sql
CREATE TABLE "ChatSession" (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title VARCHAR(255),
  messages JSON,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Authentication

- **POST** `/api/auth/register`
  - Request: `{ username: string, password: string }`
  - Response: `{ user: { id, username }, token: string }`

- **POST** `/api/auth/login`
  - Request: `{ username: string, password: string }`
  - Response: `{ user: { id, username }, token: string }`

### Chat Sessions

- **GET** `/api/chat/sessions`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ sessions: ChatSession[] }`

- **POST** `/api/chat/sessions`
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ title?: string }`
  - Response: `{ session: ChatSession }`

- **GET** `/api/chat/sessions/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ session: ChatSession }`

- **PATCH** `/api/chat/sessions/:id`
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ title?: string, messages?: any }`
  - Response: `{ session: ChatSession }`

- **DELETE** `/api/chat/sessions/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean }`

## Using the Auth Context

Access authentication state and functions throughout your app:

```tsx
import { useAuth } from '@/context/AuthContext'

export default function MyComponent() {
  const { user, isAuthenticated, login, register, logout, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return (
    <div>
      Welcome, {user?.name}!
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}
```

## Form Styling

All form components use inline styles that can be customized. Each component has a `styles` object containing:

- `container`: Main wrapper
- `formGroup`: Individual input group
- `label`: Input labels
- `input`: Input fields
- `button`: Submit buttons
- `error`: Error messages
- `success`: Success messages

Modify the styles in each component file to match your design.

## Error Handling

All forms include error handling:

```tsx
const [error, setError] = useState('')

try {
  await login(username, password)
} catch (err) {
  setError(err instanceof Error ? err.message : 'Operation failed')
}
```

Errors are displayed to users in styled error containers.

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 1 hour
- Tokens stored in localStorage (consider using secure httpOnly cookies in production)
- API endpoints verify user ownership of resources
- Password validation enforced on client and server

## Testing

### Test User Credentials

After running `npm run db:init`:

```
Username: testuser
Password: password123
```

### Create Custom Test Users

```bash
npm run db:init
```

Then use the RegisterForm to create additional test accounts.

### Debug with Prisma Studio

```bash
npx prisma studio
```

This opens a GUI to view and modify database records.

## Troubleshooting

- **Login fails**: Verify username and password are correct
- **Messages not saving**: Check chat session ID is valid
- **Token errors**: Clear localStorage and re-login
- **Database errors**: Verify PostgreSQL is running and database exists

For more database information, see [PRISMA.md](PRISMA.md).