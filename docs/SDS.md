# PUBG Tournament Platform - Software Design Specification (Updated)

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive design specification for the PUBG Tournament Platform, a web application for managing, displaying, and interacting with PUBG esports tournaments.

### 1.2 Scope
The PUBG Tournament Platform allows tournament organizers to create and manage tournaments, teams to register and participate, and viewers to follow tournaments, teams, and matches with detailed statistics and visualizations.

### 1.3 Definitions, Acronyms, and Abbreviations
- **PUBG**: PlayerUnknown's Battlegrounds
- **API**: Application Programming Interface
- **ORM**: Object-Relational Mapping
- **JWT**: JSON Web Token
- **RBAC**: Role-Based Access Control

### 1.4 References
- Next.js 15.x Documentation
- Prisma ORM Documentation
- NextAuth.js Documentation
- TailwindCSS 4.x Documentation

## 2. System Architecture

### 2.1 High-Level Architecture
The system follows a modern web application architecture with:
- **Frontend**: Next.js React application with App Router
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Hosting**: Vercel or similar platform

### 2.2 Component Diagram
```
┌─────────────────────────────────────────────────┐
│                   Client Browser                 │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│                   Next.js Server                 │
│  ┌───────────────────────┐ ┌──────────────────┐ │
│  │   App Router (Pages)  │ │    API Routes    │ │
│  └───────────────────────┘ └────────┬─────────┘ │
│  ┌───────────────────────┐          │          │
│  │     UI Components     │          │          │
│  └───────────────────────┘          │          │
└─────────────────────────────────────┼───────────┘
                                      │
┌─────────────────────────────────────▼───────────┐
│                  Prisma ORM                     │
└─────────────────────────────────────┬───────────┘
                                      │
┌─────────────────────────────────────▼───────────┐
│                PostgreSQL Database              │
└─────────────────────────────────────────────────┘
```

### 2.3 Technology Stack
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

## 3. Database Design

### 3.1 Entity-Relationship Diagram
```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │  Tournament │       │    Team     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ name        │       │ name        │       │ name        │
│ email       │◄──┐   │ slug        │   ┌──►│ logo        │
│ password    │   │   │ description │   │   │ description │
│ role        │   │   │ startDate   │   │   │ createdAt   │
│ createdAt   │   │   │ endDate     │   │   │ updatedAt   │
│ updatedAt   │   │   │ status      │   │   └─────────────┘
└─────────────┘   │   │ bannerImage │   │          ▲
                  │   │ prizePool   │   │          │
                  │   │ createdAt   │   │          │
                  │   │ updatedAt   │   │   ┌─────────────┐
                  │   └─────────────┘   │   │   Player    │
                  │          ▲          │   ├─────────────┤
                  │          │          │   │ id          │
┌─────────────┐   │          │          │   │ name        │
│  Following  │   │   ┌─────────────┐   │   │ ingameId    │
├─────────────┤   │   │TournamentTeam│   │   │ teamId     │
│ id          │   │   ├─────────────┤   │   │ createdAt   │
│ userId      │───┘   │ id          │   │   │ updatedAt   │
│ entityType  │       │ tournamentId│───┘   └─────────────┘
│ entityId    │       │ teamId      │               ▲
│ createdAt   │       │ createdAt   │               │
└─────────────┘       └─────────────┘               │
                              ▲                     │
                              │                     │
                      ┌───────────────┐   ┌─────────────┐
                      │    Match      │   │ PlayerStats │
                      ├───────────────┤   ├─────────────┤
                      │ id            │   │ id          │
                      │ tournamentId  │   │ matchId     │
                      │ round         │   │ playerId    │
                      │ matchNumber   │   │ kills       │
                      │ team1Id       │   │ deaths      │
                      │ team2Id       │   │ assists     │
                      │ team1Score    │   │ damage      │
                      │ team2Score    │   │ createdAt   │
                      │ winnerId      │   │ updatedAt   │
                      │ status        │   └─────────────┘
                      │ scheduledDate │
                      │ completedDate │
                      │ createdAt     │
                      │ updatedAt     │
                      └───────────────┘
```

### 3.2 Schema Implementation
The database schema has been implemented using Prisma ORM. The schema includes all the models shown in the diagram above with their relationships.

**Implementation Status:**
- ✅ All models defined in Prisma schema
- ✅ Database migrations created and applied
- ✅ Basic seed data for testing created

## 4. Component Design

### 4.1 Directory Structure
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

### 4.2 Key Components

#### 4.2.1 Page Components
- ✅ `app/page.tsx`: Home page with featured tournaments
- ✅ `app/tournaments/page.tsx`: List of tournaments
- ✅ `app/tournaments/[slug]/page.tsx`: Tournament details
- ✅ `app/teams/page.tsx`: List of teams
- ✅ `app/teams/[slug]/page.tsx`: Team details
- ✅ `app/admin-new/page.tsx`: Admin dashboard
- ✅ `app/admin-new/tournaments/page.tsx`: Tournament management
- ✅ `app/admin-new/teams/page.tsx`: Team management
- ✅ `app/admin-new/players/page.tsx`: Player management
- ✅ `app/auth/login/page.tsx`: Login page
- ✅ `app/auth/register/page.tsx`: Registration page

#### 4.2.2 UI Components
- ✅ `components/tournament/TournamentCard.jsx`: Tournament card display
- ✅ `components/team/TeamCard.jsx`: Team card display
- ✅ `components/match/MatchList.jsx`: Match listing and results
- ✅ `components/team/TeamStats.jsx`: Team statistics display
- ✅ `components/ui/button/Button.jsx`: Reusable button component
- ✅ `components/ui/FollowButton/index.jsx`: Button to follow tournaments/teams
- ⬜ `components/tournament/TournamentBracket.jsx`: Tournament bracket visualization (to be implemented)

### 4.3 Component Interactions
The application follows a client-server architecture with Next.js serving both the frontend and backend:

- Client-side React components fetch data through API routes
- Server-side rendering is used for initial page loads
- Client-side navigation is used for SPA-like experience
- API routes handle data operations and interact with the database via Prisma

## 5. API Design

### 5.1 RESTful API Endpoints

#### Authentication
- ✅ `POST /api/auth/register`: Register a new user
- ✅ `POST /api/auth/login`: Log in a user via NextAuth
- ✅ `GET /api/auth/session`: Get current session
- ✅ `POST /api/auth/logout`: Log out current user

#### Tournaments
- ✅ `GET /api/admin/tournaments`: List tournaments (admin)
- ✅ `GET /api/admin/tournaments/:id`: Get tournament details (admin)
- ✅ `POST /api/admin/tournaments`: Create a tournament (admin)
- ✅ `PUT /api/admin/tournaments/:id`: Update a tournament (admin)
- ✅ `DELETE /api/admin/tournaments/:id`: Delete a tournament (admin)
- ✅ `GET /api/admin/tournaments/:id/teams`: Get teams in a tournament (admin)
- ✅ `POST /api/admin/tournaments/:id/teams`: Add team to tournament (admin)
- ✅ `DELETE /api/admin/tournaments/:id/teams/:teamId`: Remove team from tournament (admin)

#### Teams
- ✅ `GET /api/admin/teams`: List teams (admin)
- ✅ `GET /api/admin/teams/:id`: Get team details (admin)
- ✅ `POST /api/admin/teams`: Create a team (admin)
- ✅ `PUT /api/admin/teams/:id`: Update a team (admin)
- ✅ `DELETE /api/admin/teams/:id`: Delete a team (admin)

#### Players
- ✅ `GET /api/admin/players`: List players (admin)
- ✅ `GET /api/admin/players/:id`: Get player details (admin)
- ✅ `POST /api/admin/players`: Create a player (admin)
- ✅ `PUT /api/admin/players/:id`: Update a player (admin)
- ✅ `DELETE /api/admin/players/:id`: Delete a player (admin)

#### Matches (To be implemented)
- ⬜ `GET /api/admin/matches`: List matches (admin)
- ⬜ `GET /api/admin/matches/:id`: Get match details (admin)
- ⬜ `POST /api/admin/matches`: Create a match (admin)
- ⬜ `PUT /api/admin/matches/:id`: Update a match (admin)
- ⬜ `DELETE /api/admin/matches/:id`: Delete a match (admin)

#### Public API (To be implemented)
- ⬜ `GET /api/tournaments`: List public tournaments
- ⬜ `GET /api/tournaments/:slug`: Get public tournament details
- ⬜ `GET /api/teams`: List public teams
- ⬜ `GET /api/teams/:slug`: Get public team details
- ⬜ `GET /api/matches`: List public matches
- ⬜ `GET /api/matches/:id`: Get public match details

### 5.2 API Response Format
All API responses follow a consistent JSON format:

```json
{
  "success": true|false,
  "data": {}, // Main response data (when success is true)
  "error": {  // Error information (when success is false)
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## 6. Security Design

### 6.1 Authentication
- ✅ NextAuth.js for authentication
- ✅ JWT-based sessions
- ✅ Secure password hashing with bcrypt
- ✅ CSRF protection

### 6.2 Authorization
- ✅ Role-based access control (RBAC)
- ✅ Route protection for sensitive pages and API endpoints
- ✅ Resource-level permissions

### 6.3 Data Validation
- ✅ Input validation using Zod schema validation
- ✅ Sanitization of user inputs
- ✅ Prevention of common security vulnerabilities

## 7. UI/UX Design

### 7.1 Design System
- ✅ Dark-themed UI with purple accent colors
- ✅ Responsive design for all screen sizes
- ✅ Consistent use of TailwindCSS utility classes

### 7.2 Key User Interfaces
- ✅ Home page with featured tournaments
- ✅ Tournament listing page
- ✅ Team listing page
- ✅ Tournament details page
- ✅ Team details page
- ✅ Admin dashboard
- ✅ Admin team management
- ✅ Admin player management
- ✅ Admin tournament management
- ⬜ Tournament bracket visualization (to be implemented)
- ⬜ Match detail view (to be implemented)
- ⬜ User dashboard (to be implemented)

## 8. Current Implementation Status

### 8.1 Completed Features
- ✅ Database schema design and implementation
- ✅ Authentication system (registration, login)
- ✅ Team management (create, view, edit, delete)
- ✅ Player management (create, view, edit, delete)
- ✅ Tournament management (create, view, edit, delete)
- ✅ Tournament team management
- ✅ Admin dashboard with statistics
- ✅ Public pages for viewing tournaments and teams
- ✅ Basic component library (buttons, cards, etc.)

### 8.2 In Progress
- ⬜ Match management
- ⬜ Tournament bracket visualization
- ⬜ User profile and personalization

### 8.3 Planned Features
- ⬜ Advanced statistics tracking
- ⬜ Tournament scheduling
- ⬜ Real-time updates for live matches
- ⬜ Social features (comments, forums)
- ⬜ Integration with PUBG API for live data

## 9. Future Considerations

### 9.1 Scalability
- Database indexing strategies for improved performance
- Caching mechanisms for frequently accessed data
- Optimizations for high traffic during tournaments

### 9.2 Feature Expansion
- Mobile application
- Live streaming integration
- Advanced analytics
- Social features

### 9.3 Internationalization
- Multi-language support
- Region-specific features

## Appendices

### Appendix A: API Response Examples
Examples of API responses for common operations.

### Appendix B: References
- Documentation links for all technologies used
- External resources for further development