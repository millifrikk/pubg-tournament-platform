import { notFound } from "next/navigation";
import Link from "next/link";
import { getTournamentBySlug, getTournamentMatches } from "@/lib/data/tournaments";
import { formatDate, timeUntil } from "@/lib/utils";
import MatchList from "@/components/match/MatchList";
import FollowButton from "@/components/ui/FollowButton";

interface TournamentPageProps {
  params: {
    slug: string;
  };
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const tournament = await getTournamentBySlug(params.slug);
  
  if (!tournament) {
    notFound();
  }
  
  const matches = await getTournamentMatches(tournament.id);
  
  const statusColors = {
    UPCOMING: "bg-blue-900/20 text-blue-400 border-blue-800",
    ONGOING: "bg-green-900/20 text-green-400 border-green-800",
    COMPLETED: "bg-gray-900/20 text-gray-400 border-gray-800",
    CANCELLED: "bg-red-900/20 text-red-400 border-red-800",
  };
  
  return (
    <div className="bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tournament Banner */}
        <div className="relative mb-8 h-64 overflow-hidden rounded-lg">
          {tournament.bannerImage ? (
            <img
              src={tournament.bannerImage}
              alt={tournament.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-700">
              <span className="text-3xl font-bold text-gray-500">
                {tournament.name}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-6">
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
              <span
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  statusColors[tournament.status]
                }`}
              >
                {tournament.status}
              </span>
            </div>
            <p className="text-gray-300">{tournament.description}</p>
          </div>
        </div>
        
        {/* Tournament Info */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-gray-800 p-4">
            <h2 className="mb-4 text-lg font-bold text-white">Tournament Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-gray-400">Start Date</h3>
                  <p className="text-white">{formatDate(tournament.startDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">End Date</h3>
                  <p className="text-white">{formatDate(tournament.endDate)}</p>
                </div>
              </div>
              
              {tournament.status === "UPCOMING" && (
                <div>
                  <h3 className="text-sm text-gray-400">Starts in</h3>
                  <p className="font-medium text-purple-400">
                    {timeUntil(tournament.startDate)}
                  </p>
                </div>
              )}
              
              {tournament.prizePool && (
                <div>
                  <h3 className="text-sm text-gray-400">Prize Pool</h3>
                  <p className="font-bold text-purple-400">{tournament.prizePool}</p>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <FollowButton entityId={tournament.id} entityType="TOURNAMENT" />
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-gray-800 p-4">
            <h2 className="mb-4 text-lg font-bold text-white">Participating Teams</h2>
            
            {tournament.teams.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No teams have joined this tournament yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {tournament.teams.map(({ team }) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.slug}`}
                    className="flex items-center rounded-md bg-gray-700 p-3 transition-colors hover:bg-gray-600"
                  >
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="mr-3 h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-700">
                        <span className="font-bold text-white">
                          {team.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-white">{team.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Tournament Matches */}
        <div className="mb-8">
          <MatchList
            matches={matches}
            title="Tournament Matches"
            emptyMessage="No matches scheduled yet."
          />
        </div>
        
        {/* Tournament Rules */}
        {tournament.rules && (
          <div className="rounded-lg bg-gray-800 p-4">
            <h2 className="mb-4 text-lg font-bold text-white">Tournament Rules</h2>
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: tournament.rules }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}