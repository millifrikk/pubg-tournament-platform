# PUBG Tournament Platform

A comprehensive web application for managing, displaying, and interacting with PUBG esports tournaments.

## Features

- Tournament management
- Team and player registration
- Interactive tournament brackets
- Match scheduling and reporting
- Advanced statistics tracking
- User profiles and following system

## Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/pubg-tournament-platform.git
   cd pubg-tournament-platform
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env` (if not already done)
   - Update the `DATABASE_URL` with your PostgreSQL connection details
   - Generate a secure `NEXTAUTH_SECRET` (you can use `openssl rand -base64 32`)

4. Set up the database
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed the database with sample data
   npm run prisma:seed
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Users

After seeding, you can log in with these credentials:

- **Admin User**
  - Email: admin@example.com
  - Password: admin123

- **Regular User**
  - Email: user@example.com
  - Password: user123

## Development Workflow

1. Create a feature branch from `develop`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them
   ```bash
   git add .
   git commit -m "Add feature description"
   ```

3. Push your changes and create a pull request
   ```bash
   git push origin feature/your-feature-name
   ```

## Project Structure

- `/app` - Next.js App Router pages
- `/components` - React components
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and services
- `/prisma` - Prisma ORM schema and migrations
- `/providers` - React context providers
- `/public` - Static assets

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- PUBG for the inspiration
- All contributors to this project