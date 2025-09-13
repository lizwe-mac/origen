#!/bin/bash

# Development Database Management Script

case "$1" in
  start)
    echo "Starting local PostgreSQL database..."
    docker-compose up -d postgres
    echo "PostgreSQL is starting on localhost:5432"
    echo "Database: origen_dev"
    echo "Username: postgres"
    echo "Password: postgres"
    ;;
  
  stop)
    echo "Stopping local PostgreSQL database..."
    docker-compose down
    ;;
  
  reset)
    echo "Resetting local database (this will delete all data)..."
    docker-compose down -v
    docker-compose up -d postgres
    sleep 5
    echo "Running Prisma migration..."
    cd "$(dirname "$0")/../packages/models"
    cp .env.local .env
    npx prisma generate
    npx prisma db push
    echo "Database reset complete!"
    ;;
  
  migrate)
    echo "Running database migration..."
    cd "$(dirname "$0")/../packages/models"
    cp .env.local .env
    npx prisma generate
    npx prisma db push
    echo "Migration complete!"
    ;;
  
  pgadmin)
    echo "Starting pgAdmin..."
    docker-compose up -d pgadmin
    echo "pgAdmin available at http://localhost:5050"
    echo "Email: admin@origen.local"
    echo "Password: admin"
    ;;
  
  logs)
    docker-compose logs -f postgres
    ;;
  
  *)
    echo "Usage: $0 {start|stop|reset|migrate|pgadmin|logs}"
    echo ""
    echo "Commands:"
    echo "  start    - Start PostgreSQL container"
    echo "  stop     - Stop all containers"
    echo "  reset    - Reset database (deletes all data)"
    echo "  migrate  - Run Prisma migration"
    echo "  pgadmin  - Start pgAdmin web interface"
    echo "  logs     - Show PostgreSQL logs"
    exit 1
    ;;
esac
