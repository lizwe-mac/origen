#!/bin/bash

# Database setup script for Origen
echo "Setting up Origen database..."

# Navigate to the models package
cd "$(dirname "$0")/../packages/models"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push schema to database (creates SQLite database and tables)
echo "Creating database and tables..."
npx prisma db push

echo "Database setup complete!"
echo "SQLite database created at: packages/models/dev.db"
