import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Match {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  team1Id: string | null;
  team2Id: string | null;
  team1Score: number | null;
  team2Score: number | null;
  winnerId: string | null;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  scheduledDate: Date | string | null;
  completedDate: Date | string | null;
  tournament?: {
    name: string;
    slug: string;
  };
  team1?: {
    name: string;
    slug: string;
  } | null;
  team2?: {
    name: string;
    slug: string;
  } | null;
}

interface MatchListProps {
  matches: Match[];
  title?: string;
  emptyMessage?: string;
}

export default function MatchList({ 
  matches, 
  title = "Recent Matches", 
  emptyMessage = "No matches found." 
}: MatchListProps) {
  const getStatusBadge = (status: Match["status"]) => {
    const statusColors = {
      SCHEDULED: "bg-blue-900/20 text-blue-400 border-blue-800",
      LIVE: "bg-green-900/20 text-green-400 border-green-800",
      COMPLETED: "bg-gray-900/20 text-gray-400 border-gray-800",
      CANCELLED: "bg-red-900/20 text-red-400 border-red-800",
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <h3 className="mb-4 text-lg font-bold text-white">{title}</h3>
      
      {matches.length === 0 ? (
        <p className="text-center text-gray-400 py-4">{emptyMessage}</p>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="rounded-md bg-gray-700 p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-400">
                  {match.tournament?.name && (
                    <Link href={`/tournaments/${match.tournament.slug}`} className="hover:text-purple-400">
                      {match.tournament.name}
                    </Link>
                  )}
                  {" - "}Round {match.round}, Match {match.matchNumber}
                </div>
                {getStatusBadge(match.status)}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {match.team1 ? (
                    <Link href={`/teams/${match.team1.slug}`} className="font-medium text-white hover:text-purple-400">
                      {match.team1.name}
                    </Link>
                  ) : (
                    <span className="text-gray-400">TBD</span>
                  )}
                </div>
                
                <div className="flex items-center px-4">
                  {match.status === "COMPLETED" ? (
                    <div className="flex items-center space-x-1">
                      <span className={`text-xl font-bold ${match.winnerId === match.team1Id ? "text-green-400" : "text-white"}`}>
                        {match.team1Score || 0}
                      </span>
                      <span className="text-gray-400 mx-1">-</span>
                      <span className={`text-xl font-bold ${match.winnerId === match.team2Id ? "text-green-400" : "text-white"}`}>
                        {match.team2Score || 0}
                      </span>
                    </div>
                  ) : match.status === "SCHEDULED" ? (
                    <span className="text-sm text-gray-400">
                      {match.scheduledDate ? formatDate(match.scheduledDate) : "TBD"}
                    </span>
                  ) : match.status === "LIVE" ? (
                    <span className="animate-pulse text-sm font-bold text-green-400">LIVE</span>
                  ) : (
                    <span className="text-sm text-gray-400">Cancelled</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {match.team2 ? (
                    <Link href={`/teams/${match.team2.slug}`} className="font-medium text-white hover:text-purple-400">
                      {match.team2.name}
                    </Link>
                  ) : (
                    <span className="text-gray-400">TBD</span>
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-right">
                <Link href={`/matches/${match.id}`} className="text-sm text-purple-400 hover:text-purple-300">
                  View details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}