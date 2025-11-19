# Database Setup Guide

This guide will help you set up the PostgreSQL database for Mementia.

## Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 20+ installed
- npm or pnpm installed

## Step 1: Create Database

Create a new PostgreSQL database:

```bash
# Using psql
createdb mementia

# Or connect to PostgreSQL and run:
CREATE DATABASE mementia;
```

## Step 2: Configure Environment Variables

Create a `.env` file in the project root (you can copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and set your database connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/mementia?schema=public"
```

Replace `username` and `password` with your PostgreSQL credentials.

## Step 3: Run Prisma Migrations

Generate Prisma Client and run migrations to create tables:

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate
```

This will create all necessary tables:
- users
- user_settings
- emotions
- emotion_tags
- future_letters
- reviews
- challenges
- user_challenges
- activity_logs
- stardust_transactions
- badges
- user_badges

## Step 4: Seed Initial Data

Populate the database with initial badges and challenges:

```bash
npm run db:seed
```

This will create:
- **20+ Badges**: Including FIRST_RECORD, WEEK_STREAK, MONTH_STREAK, etc.
- **25+ Challenges**: Across 5 categories (social, self-care, creativity, mindfulness, action)

## Step 5: Verify Setup

You can verify the database setup using Prisma Studio:

```bash
npm run db:studio
```

This will open a web interface at http://localhost:5555 where you can view and edit your database.

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **Check PostgreSQL is running**:
   ```bash
   # On macOS/Linux
   pg_isready

   # On Windows
   pg_isready -U postgres
   ```

2. **Verify database exists**:
   ```bash
   psql -l | grep mementia
   ```

3. **Test connection**:
   ```bash
   psql -d mementia -U your_username
   ```

### Migration Errors

If migrations fail:

1. **Reset database** (⚠️ This will delete all data):
   ```bash
   npx prisma migrate reset
   ```

2. **Check Prisma version**:
   ```bash
   npx prisma --version
   ```

3. **Generate Prisma Client again**:
   ```bash
   npx prisma generate
   ```

### Seed Data Issues

If seeding fails:

1. **Check if tables exist**:
   ```bash
   npx prisma studio
   ```

2. **Run seed manually**:
   ```bash
   npx tsx prisma/seed.ts
   ```

## Using Docker (Alternative)

If you prefer using Docker for PostgreSQL:

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# The database will be available at:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mementia"
```

Then follow steps 3-5 above.

## Next Steps

After setting up the database:

1. Deploy Discord commands: `npm run deploy-commands`
2. Start the bot: `npm run dev`
3. Test the `/ping` command in Discord

## Database Backups

To backup your database:

```bash
# Create backup
pg_dump mementia > backup.sql

# Restore from backup
psql mementia < backup.sql
```

## Schema Changes

When you modify `prisma/schema.prisma`:

1. Create a new migration:
   ```bash
   npx prisma migrate dev --name description_of_change
   ```

2. The migration will be applied automatically

3. Commit both the schema and migration files to git

## Production Deployment

For production:

1. Use a managed PostgreSQL service (Supabase, Railway, Neon, etc.)
2. Set `DATABASE_URL` to your production database
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Seed data if needed:
   ```bash
   npm run db:seed
   ```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Discord.js Guide](https://discordjs.guide/)
