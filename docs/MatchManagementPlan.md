# PUBG Tournament Platform - Match Management Implementation Plan

## Overview

This document outlines the implementation plan for the Match Management feature, which is the current focus for the PUBG Tournament Platform. Match Management is a critical component that will enable tournament organizers to create, track, and report match results.

## 1. Database Models

We will use the existing Match and PlayerStats models defined in the Prisma schema:

```prisma
model Match {
  id            String       @id @default(cuid())
  tournamentId  String
  tournament    Tournament   @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  round         Int
  matchNumber   Int
  team1Id       String
  team1         Team         @relation("Team1Matches", fields: [team1Id], references: [id])
  team2Id       String
  team2         Team         @relation("Team2Matches", fields: [team2Id], references: [id])
  team1Score    Int          @default(0)
  team2Score    Int          @default(0)
  winnerId      String?
  winner        Team?        @relation("WinnerMatches", fields: [winnerId], references: [id])
  status        String       @default("scheduled") // scheduled, in_progress, completed, cancelled
  scheduledDate DateTime?
  completedDate DateTime?
  playerStats   PlayerStats[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@unique([tournamentId, round, matchNumber])
}

model PlayerStats {
  id          String   @id @default(cuid())
  matchId     String
  match       Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  playerId    String
  player      Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
  kills       Int      @default(0)
  deaths      Int      @default(0)
  assists     Int      @default(0)
  damage      Float    @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([matchId, playerId])
}
```

## 2. API Endpoints

We'll implement the following API endpoints:

### Admin API
1. `GET /api/admin/matches` - List all matches (with filtering options)
2. `GET /api/admin/matches/:id` - Get match details
3. `POST /api/admin/matches` - Create a new match
4. `PUT /api/admin/matches/:id` - Update match details
5. `DELETE /api/admin/matches/:id` - Delete a match
6. `PUT /api/admin/matches/:id/status` - Update match status
7. `POST /api/admin/matches/:id/player-stats` - Add/update player statistics

### Public API
1. `GET /api/matches` - List public matches
2. `GET /api/matches/:id` - Get public match details
3. `GET /api/tournaments/:slug/matches` - Get matches for a specific tournament

## 3. Component Structure

```
/app
  /admin-new
    /matches
      /page.tsx              # Match listing for admin
      /[id]/page.tsx         # Match detail/edit page
      /new/page.tsx          # New match creation page
  /api
    /admin
      /matches
        /route.ts            # GET (list), POST (create)
        /[id]/route.ts       # GET, PUT, DELETE
        /[id]/status/route.ts # PUT (status update)
        /[id]/player-stats/route.ts # POST (player stats)

/components
  /match
    /MatchForm.jsx           # Form for creating/editing matches
    /MatchList.jsx           # List component for matches
    /MatchCard.jsx           # Card component for match display
    /MatchDetail.jsx         # Match detail component
    /PlayerStatsForm.jsx     # Form for entering player statistics
    /PlayerStatsList.jsx     # Component to display player statistics
```

## 4. Implementation Steps

### 4.1 Backend Implementation

1. **Create Data Access Functions**
   - Create CRUD functions in `lib/data/match.js`
   - Implement filtering and pagination
   - Create functions for player statistics

2. **Implement API Routes**
   - Implement all admin API endpoints
   - Add proper validation using Zod
   - Implement error handling
   - Add authentication and authorization checks

### 4.2 Frontend Implementation

1. **Admin Interface**
   - Create match listing page with filtering options
   - Implement match creation form
   - Build match editing interface
   - Create match detail view
   - Implement player statistics entry form

2. **Public Interface**
   - Add match listing to tournament detail page
   - Create match detail view for public access
   - Implement match result display

### 4.3 Integration

1. **Connect to Tournament System**
   - Add match creation options to tournament management
   - Link matches to tournament brackets (preparation for next feature)
   - Display match history on team pages

2. **Add Testing**
   - Write unit tests for critical functions
   - Test all API endpoints
   - Conduct UI testing for forms and displays

## 5. Feature Breakdown and Tasks

### Week 1: Core Implementation

#### Day 1-2: Data Layer
- [ ] Create match data access functions
- [ ] Implement player statistics data functions
- [ ] Add validation schemas

#### Day 3-4: API Routes
- [ ] Implement match CRUD API endpoints
- [ ] Create player statistics API endpoints
- [ ] Add proper error handling and validation

#### Day 5: Admin Interface Basics
- [ ] Create match listing page
- [ ] Implement basic filtering

### Week 2: Complete Implementation

#### Day 1-2: Admin Interface
- [ ] Create match creation form
- [ ] Build match editing interface
- [ ] Implement match detail view

#### Day 3-4: Player Statistics
- [ ] Create player statistics entry form
- [ ] Implement statistics display
- [ ] Add batch update functionality

#### Day 5: Public Interface
- [ ] Add match display to tournament pages
- [ ] Create public match detail view
- [ ] Implement match history on team pages

## 6. Testing and Quality Assurance

- Implement unit tests for data access functions
- Test all API endpoints with Postman or similar tool
- Conduct UI testing on desktop and mobile
- Verify data integrity with test scenarios

## 7. Considerations and Edge Cases

- Handle conflicts when updating match status
- Ensure consistent score calculation
- Validate that teams in match belong to the tournament
- Consider time zone handling for scheduled matches
- Implement proper error states in UI
- Add loading indicators for better UX

## 8. Documentation

- Update API documentation with new endpoints
- Add comments to complex functions
- Create usage examples for frontend components

## Conclusion

This implementation plan provides a structured approach to adding match management capabilities to the PUBG Tournament Platform. Once completed, it will enable tournament organizers to create and manage matches, track player statistics, and display results to viewers. This feature serves as the foundation for the tournament bracket visualization that will follow.
