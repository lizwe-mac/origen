#!/bin/bash

# Environment Switching Script for Origen

case "$1" in
  local)
    echo "Switching to local development environment..."
    cp apps/server/.env.local apps/server/.env
    cp packages/models/.env.local packages/models/.env
    echo "✓ Using local PostgreSQL database"
    echo "  Database: postgresql://postgres:postgres@localhost:5432/origen_dev"
    ;;
  
  supabase)
    echo "Switching to Supabase environment..."
    # Restore Supabase config (you'll need to update these with your actual values)
    cat > apps/server/.env << EOF
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:23rdNov@rTh30r3m@db.torxmklumnzfybqimaut.supabase.co:5432/postgres"
SUPABASE_URL="https://torxmklumnzfybqimaut.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvcnhta2x1bW56ZnlicWltYXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDc0MTMsImV4cCI6MjA3MTYyMzQxM30.K5FtnyLgW8wSG_LifuspSn8zmX1TlGRK8iAbeadMjRM"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# File Upload
UPLOAD_DIR="uploads"
MAX_FILE_SIZE="10485760"

# OCR Service (placeholder for future implementation)
OCR_API_KEY="your-ocr-api-key"
OCR_API_URL="https://api.ocr-service.com"
EOF

    cat > packages/models/.env << EOF
DATABASE_URL="postgresql://postgres:23rdNov@rTh30r3m@db.torxmklumnzfybqimaut.supabase.co:5432/postgres"
EOF
    echo "✓ Using Supabase PostgreSQL database"
    echo "  Database: Supabase Cloud"
    ;;
  
  *)
    echo "Usage: $0 {local|supabase}"
    echo ""
    echo "Commands:"
    echo "  local     - Switch to local PostgreSQL database"
    echo "  supabase  - Switch to Supabase cloud database"
    echo ""
    echo "Current environment:"
    if grep -q "localhost:5432" apps/server/.env 2>/dev/null; then
      echo "  → Local PostgreSQL"
    elif grep -q "supabase.co" apps/server/.env 2>/dev/null; then
      echo "  → Supabase Cloud"
    else
      echo "  → Unknown/Not configured"
    fi
    exit 1
    ;;
esac
