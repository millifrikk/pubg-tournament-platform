import { prisma } from "@/lib/db/prisma";

export async function getTournamentBySlug(slug: string) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { slug },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
        matches: {
          orderBy: {
            round: "asc",
          },
        },
      },
    });
    
    return tournament;
  } catch (error) {
    console.error(`Error fetching tournament with slug ${slug}:`, error);
    return null;
  }
}

export async function getTournamentMatches(tournamentId: string) {
  try {
    const matches = await prisma.match.findMany({
      where: {
        tournamentId: tournamentId,
      },
      orderBy: [
        { round: "asc" },
        { matchNumber: "asc" },
      ],
    });
    
    // Enrich matches with team data
    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {
        let team1 = null;
        let team2 = null;
        
        if (match.team1Id) {
          team1 = await prisma.team.findUnique({
            where: { id: match.team1Id },
            select: { name: true, slug: true },
          });
        }
        
        if (match.team2Id) {
          team2 = await prisma.team.findUnique({
            where: { id: match.team2Id },
            select: { name: true, slug: true },
          });
        }
        
        return {
          ...match,
          team1,
          team2,
        };
      })
    );
    
    return enrichedMatches;
  } catch (error) {
    console.error(`Error fetching matches for tournament ${tournamentId}:`, error);
    return [];
  }
}