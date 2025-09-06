# Origen - Receipt Management App

A cross-platform receipt management solution built with TypeScript, React, React Native, and Express. Supports both OCR receipt upload and manual receipt entry with a unified interface.

## Architecture

This is a Yarn v4 monorepo with the following structure:

```
origen/
├── apps/
│   ├── web/          # React + Vite web application
│   ├── server/       # Express + TypeScript API server
│   └── native/       # React Native mobile app (TODO)
├── packages/
│   ├── models/       # Shared Zod schemas and Prisma types
│   ├── state/        # XState state machines
│   ├── utils/        # Shared utilities
│   └── ui/           # Shared UI components (TODO)
```

## Features

- **Manual Receipt Entry**: Multi-step form with XState for receipt creation
- **OCR Upload**: File upload with OCR processing (placeholder implementation)
- **Authentication**: JWT-based auth with signup/login
- **Receipt Management**: CRUD operations with filtering and pagination
- **Type Safety**: End-to-end TypeScript with strict mode
- **Modern UI**: TailwindCSS with Radix UI components

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Radix UI
- **Backend**: Express, Prisma ORM, PostgreSQL
- **State Management**: XState
- **Validation**: Zod schemas
- **Authentication**: JWT with bcrypt
- **Package Manager**: Yarn v4 (Berry)

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Yarn v4

## Quick Start

1. **Clone and install dependencies**:
```bash
yarn install
```

2. **Set up environment variables**:
```bash
# Copy environment files
cp apps/server/.env.example apps/server/.env

# Edit apps/server/.env with your database URL and JWT secret
```

3. **Set up the database**:
```bash
cd apps/server
yarn db:generate
yarn db:migrate
```

4. **Start development servers**:
```bash
# Start all apps in development mode
yarn dev

# Or start individually:
yarn workspace @origen/server dev    # API server on :3001
yarn workspace @origen/web dev       # Web app on :3000
```

## Environment Variables

### Server (.env)
```env
DATABASE_URL="postgresql://get_url_from_team"
JWT_SECRET="get_from_team"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE="10485760"
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/login` | User authentication |
| POST | `/api/receipts/manual` | Create manual receipt |
| POST | `/api/receipts/upload` | Upload receipt file |
| GET | `/api/receipts` | List receipts with filters |
| GET | `/api/receipts/:id` | Get receipt by ID |
| PATCH | `/api/receipts/:id` | Update receipt |

## Development

### Building packages
```bash
yarn build
```

### Running tests
```bash
yarn test
```

### Linting
```bash
yarn lint
```

### Database operations
```bash
cd apps/server

# Generate Prisma client
yarn db:generate

# Run migrations
yarn db:migrate

# Open Prisma Studio
yarn db:studio

# Reset database
yarn db:push
```

## Project Structure

### Shared Packages

- **@origen/models**: Zod validation schemas, Prisma types, and API contracts
- **@origen/state**: XState machines for complex UI flows
- **@origen/utils**: Shared utilities for auth, validation, and formatting

### Apps

- **@origen/web**: React web application with modern UI
- **@origen/server**: Express API server with full TypeScript support

## User Journeys

1. **Sign up/Login**: JWT-based authentication
2. **Manual Receipt Entry**: Multi-step form with validation
3. **Receipt Upload**: File upload with OCR processing
4. **Receipt Management**: View, edit, and organize receipts
5. **Reporting**: Filter and export receipt data

## Contributing

1. Install dependencies: `yarn install`
2. Set up environment variables
3. Run database migrations
4. Start development servers: `yarn dev`
5. Make changes and test
6. Submit pull request

## License

MIT License - see LICENSE file for details
