import TeamCard from "@/components/team/TeamCard";
import { prisma } from "@/lib/db/prisma";

async function getTeams() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return teams;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export default async function TeamsPage() {
  const teams = await getTeams();
  
  return (
    <div className="bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Teams</h1>
          <p className="mt-3 text-xl text-gray-400">
            Explore the teams competing in PUBG tournaments
          </p>
        </div>
        
        {teams.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-400">No teams available at the moment.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}