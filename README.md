# Webinar Project

A modern note-taking application built with Next.js 14.

## Quick Start

1. **Prerequisites**
   - Node.js version 20
   - npm
   - Docker and Docker Compose (for local database)

2. **Installation**
   ```bash
   # Install dependencies
   npm ci

   # Create environment file (if needed)
   cp .env .env.local

   # Start PostgreSQL database and run migrations
   npm run setup

   # Start development server
   npm run dev
   ```

   The app will be available at http://localhost:3000

## Available Commands

```bash
# Application commands
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run code linting

# Database commands
npm run setup    # Start database and run migrations (all-in-one)
npm run db:start # Start PostgreSQL in Docker
npm run db:stop  # Stop PostgreSQL container
npm run db:reset # Reset database (delete all data and recreate schema)
npm run db:migrate # Run Prisma migrations
npm run db:generate # Generate Prisma client
npm run db:studio # Open Prisma Studio (database GUI)
```

## Project Structure

```
src/
├── app/           # Pages and API routes
├── components/    # React components
├── context/       # React contexts
└── lib/          # Utility functions
```

## Environment Variables

The project includes a default `.env` file with the correct database connection for Docker:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/webinar_db"
```

You can copy this to `.env.local` if you need to make local changes:
```bash
cp .env .env.local
```

## Docker Database Setup

The project uses Docker to run PostgreSQL locally:

1. The database runs in a container defined in `docker-compose.yml`
2. Data is persisted in a Docker volume
3. The database is accessible at `localhost:5432`
4. Default credentials: 
   - Username: `postgres`
   - Password: `postgres`
   - Database: `webinar_db`

To manually manage the database:
```bash
# Start the database
docker-compose up -d

# Stop the database
docker-compose down

# Reset the database (delete all data)
docker-compose down -v
```

## Tech Stack

- Next.js 14.2.24
- TypeScript
- Node.js 20
- React Markdown for note rendering
- PostgreSQL (via Prisma ORM)

## Database Schema

The application uses PostgreSQL with Prisma ORM. The schema includes:

### Tables
1. `cloud_notes`
   - Note storage with title, content, and path
   - Organized in folders
   - Timestamps for creation and updates

2. `cloud_folders`
   - Hierarchical folder structure
   - Unique paths for navigation
   - Parent-child relationships

### Setting Up the Database

1. Configure your database connection in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/webinar_project"
   ```

2. Run the migrations:
   ```bash
   # Apply all migrations
   npx prisma migrate deploy
   
   # Generate Prisma Client
   npx prisma generate
   ```

## AWS RDS Requirements

### Database Specifications
- **Engine**: PostgreSQL 14+
- **Instance**: db.t3.micro (minimum), db.t3.small recommended for production
- **Storage**: 20 GB gp3 minimum
- **Multi-AZ**: Recommended for production
- **Backup**: 7 days retention minimum

### Security
- VPC with private subnet recommended
- Security group: Allow port 5432 from application servers only
- Encryption at rest enabled
- SSL/TLS required for connections

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Apply database migrations:
   ```bash
   npx prisma migrate deploy
   ```

3. Start the server:
   ```bash
   npm start
   ```

For production deployment, using a process manager like PM2 is recommended:
```bash
npm install -g pm2
pm2 start npm --name "webinar-project" -- start
```
