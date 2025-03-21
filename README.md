# PUBG Tournament Platform

A comprehensive web application for managing PUBG esports tournaments. The platform allows tournament organizers to create and manage tournaments, teams to register and participate, and viewers to follow tournaments, teams, and matches with detailed statistics and visualizations.

![PUBG Tournament Banner](https://github.com/millifrikk/pubg-tournament-platform/raw/main/public/images/banner.png)

## Features

### Completed Features ✅

- **Authentication System**
  - User registration and login
  - Role-based access control
  - Secure password handling

- **Tournament Management**
  - Create, edit, and delete tournaments
  - Tournament details view
  - Tournament status management

- **Team Management**
  - Create, edit, and delete teams
  - Team details view
  - Player management within teams

- **Player Management**
  - Player profiles
  - Player statistics
  - Team assignments

- **Admin Dashboard**
  - Overview statistics
  - Management interfaces
  - User management

### In Progress / Planned Features ⬜

- **Match Management**
  - Match creation and editing
  - Match result reporting
  - Match statistics

- **Tournament Brackets**
  - Interactive bracket visualization
  - Automatic bracket generation
  - Different tournament formats support

- **Advanced Statistics**
  - Detailed player performance tracking
  - Team statistics
  - Tournament statistics visualization

- **User Features**
  - Following teams and tournaments
  - Personalized dashboard
  - Notifications

## Tech Stack

- **Frontend**: 
  - Next.js 15.x
  - React 19.x
  - TailwindCSS 4.x
  - React Hook Form
  - Zod for validation
  - TanStack Table for data display

- **Backend**:
  - Next.js API Routes
  - Prisma ORM
  - NextAuth.js for authentication
  - bcrypt for password hashing

- **Database**:
  - PostgreSQL

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/millifrikk/pubg-tournament-platform.git
   cd pubg-tournament-platform
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your database connection string and other required variables.

4. Set up the database
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Seed the database (optional)
   ```bash
   npx prisma db seed
   ```

6. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pubg_tournament"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Other config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Project Structure

```
/
├── app/                      # Next.js App Router pages
│   ├── admin-new/            # Admin dashboard and management
│   ├── api/                  # API Routes
│   ├── auth/                 # Authentication pages
│   ├── teams/                # Team pages
│   ├── tournaments/          # Tournament pages
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── admin/                # Admin-specific components
│   ├── layout/               # Layout components (Navbar, Footer)
│   ├── match/                # Match-related components
│   ├── team/                 # Team-related components
│   ├── tournament/           # Tournament-related components
│   └── ui/                   # Reusable UI components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions and services
│   ├── db/                   # Database utilities
│   ├── data/                 # Data access functions
│   └── utils/                # General utilities
├── prisma/                   # Prisma ORM
│   └── schema.prisma         # Database schema
├── providers/                # React context providers
├── public/                   # Static assets
└── [...config files]         # Configuration files
```

## Development Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation setup | ✅ Completed |
| 2 | Basic Features | ✅ Completed |
| 3 | Advanced Features | 🚧 In Progress |
| 4 | Polish and Launch | ⬜ Planned |

Current focus:
- Match management system
- Tournament bracket visualization
- Statistics tracking and visualization

## API Endpoints

The platform provides a comprehensive API:

- Authentication endpoints (`/api/auth/*`)
- Tournament management (`/api/admin/tournaments/*`)
- Team management (`/api/admin/teams/*`)
- Player management (`/api/admin/players/*`)
- Public data access endpoints (planned)

See the [Software Design Specification](https://github.com/millifrikk/pubg-tournament-platform/blob/main/docs/SDS.md) for a full list of endpoints.

## Screenshots

*Coming soon*

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [PUBG](https://www.pubg.com/) for inspiration
- All contributors who have helped shape this project