# Supabase Database Setup

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `origen-receipts` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
6. Click "Create new project"

## 2. Get Connection Details

After project creation, you need both the database URL and API credentials:

### Database Connection:
1. Go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Copy the **URI** connection string
4. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

### API Credentials:
1. Go to **Settings** → **API**
2. Copy the **Project URL** and **anon public** key

## 3. Update Environment Variables

1. Open `apps/server/.env`
2. Replace the placeholders with your actual Supabase credentials:
   ```
   DATABASE_URL="postgresql://postgres:your-actual-password@db.your-project-ref.supabase.co:5432/postgres"
   SUPABASE_URL="https://your-project-ref.supabase.co"
   SUPABASE_ANON_KEY="your-actual-anon-key"
   ```

## 4. Run Database Migration

```bash
cd /home/lizwe/wind/packages/models
npx prisma generate
npx prisma db push
```

## 5. Verify Connection

Start your server and test the signup endpoint. You should see tables created in your Supabase dashboard under **Table Editor**.

## Security Notes

- Never commit your actual DATABASE_URL to version control
- Use environment variables for sensitive data
- Consider using Supabase's Row Level Security (RLS) for production

## Supabase Dashboard Features

Once connected, you can use Supabase's dashboard to:
- View and edit data in **Table Editor**
- Monitor queries in **SQL Editor**
- Set up authentication (optional)
- Configure storage for receipt files
