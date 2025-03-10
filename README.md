# Webinar Project

A modern note-taking application built with Next.js 14.

## Quick Start

1. **Prerequisites**
   - Node.js version 20
   - npm
   - PostgreSQL 14+ (or AWS RDS)

2. **Installation**
   ```bash
   # Install dependencies
   npm ci

   # Create environment file
   cp .env.example .env

   # Start development server
   npm run dev
   ```

   The app will be available at http://localhost:3000

## Available Commands

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
npm run lint   # Run code linting
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

Copy `.env.example` to `.env` and adjust the values:
- `NODE_ENV`: 'development' or 'production' - Determines the application's running environment

### Database Configuration
Required environment variable for PostgreSQL connection:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Example for local development:
```
DATABASE_URL="postgresql://user:password@localhost:5432/webinar_project"
```

Example for AWS RDS:
```
DATABASE_URL="postgresql://user:password@your-instance.xxxxx.region.rds.amazonaws.com:5432/webinar_project"
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
