import { prisma } from "@/lib/db/prisma";

export async function getTeamBySlug(slug: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { slug },
      include: {
        players: true,
        tournaments: {
          include: {
            tournament: true,
          },
        },
      },
    });
    
    return team;
  } catch (error) {
    console.error(`Error fetching team with slug ${slug}:`, error);
    return null;
  }
}

export async function getTeamMatches(teamId: string) {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { team1Id: teamId },
          { team2Id: teamId },
        ],
      },
      include: {
        tournament: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
      },
      take: 5,
    });
    
    // This is a temporary solution since we don't have team names in the match model
    // In a real app, you'd reference actual teams by ID
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
    console.error(`Error fetching matches for team ${teamId}:`, error);
    return [];
  }
}