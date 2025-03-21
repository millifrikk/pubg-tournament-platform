import { Prisma } from "@prisma/client";
import TournamentCard from "@/components/tournament/TournamentCard";
import { prisma } from "@/lib/db/prisma";

async function getTournaments() {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: {
        startDate: 'asc',
      },
    });
    return tournaments;
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export default async function TournamentsPage() {
  const tournaments = await getTournaments();
  
  return (
    <div className="bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Tournaments</h1>
          <p className="mt-3 text-xl text-gray-400">
            Browse and join upcoming PUBG tournaments
          </p>
        </div>
        
        {tournaments.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-400">No tournaments available at the moment.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}