# Local PostgreSQL Setup for Development

This setup allows you to develop locally with PostgreSQL and deploy to Supabase for production.

## Prerequisites

- Docker and Docker Compose installed
- WSL2 (if on Windows)

## Quick Start

### 1. Set Up Aliases (One-time setup)

```bash
# Make scripts executable and set up convenient aliases
chmod +x scripts/dev-db.sh scripts/switch-env.sh scripts/setup-aliases.sh

# Set up aliases for easy access
./scripts/setup-aliases.sh

# Activate aliases (or restart terminal)
source ~/.bashrc  # or ~/.zshrc
```

### 2. Start Development Environment

```bash
# Quick start with aliases
dev-start

# Or manually:
env-local
db-start
```

### 3. Run Database Migration

```bash
# Set up database schema
db-migrate
```

### 4. Start Your Server

Your server will now connect to the local PostgreSQL database.

## Available Commands

### Database Management (with aliases)
```bash
db-start      # Start PostgreSQL container
db-stop       # Stop all containers
db-reset      # Reset database (deletes all data)
db-migrate    # Run Prisma migration
db-pgadmin    # Start pgAdmin web interface
db-logs       # Show PostgreSQL logs
```

### Environment Switching (with aliases)
```bash
env-local     # Use local PostgreSQL
env-supabase  # Use Supabase cloud
```

### Quick Workflows (with aliases)
```bash
dev-start     # Switch to local env and start database
dev-fresh     # Reset database for fresh start
dev-status    # Check current environment and containers
```

## Database Details

**Local PostgreSQL:**
- Host: `localhost:5432`
- Database: `origen_dev`
- Username: `postgres`
- Password: `postgres`

**pgAdmin (Optional):**
- URL: `http://localhost:5050`
- Email: `admin@origen.local`
- Password: `admin`

## Development Workflow

1. **Daily Development:**
   ```bash
   ./scripts/switch-env.sh local
   ./scripts/dev-db.sh start
   # Develop and test locally
   ```

2. **Testing with Production Data:**
   ```bash
   ./scripts/switch-env.sh supabase
   # Test against Supabase
   ```

3. **Reset Local Database:**
   ```bash
   ./scripts/dev-db.sh reset
   # Fresh start with clean data
   ```

## File Structure

- `docker-compose.yml` - PostgreSQL and pgAdmin containers
- `apps/server/.env.local` - Local environment variables
- `packages/models/.env.local` - Local Prisma configuration
- `scripts/dev-db.sh` - Database management commands
- `scripts/switch-env.sh` - Environment switching

## Migration Strategy

- **Development:** Use local PostgreSQL for fast iteration
- **Testing:** Switch to Supabase to test with production-like environment
- **Production:** Deploy with Supabase configuration

The Prisma schema remains the same for both environments, ensuring consistency.
