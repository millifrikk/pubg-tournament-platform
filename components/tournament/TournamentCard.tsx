import Link from "next/link";
import { formatDate, timeUntil, truncateText } from "@/lib/utils";
import { Button } from "@/components/ui/button/Button";

interface TournamentCardProps {
  tournament: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    startDate: Date | string;
    endDate: Date | string;
    status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
    bannerImage?: string | null;
    prizePool?: string | null;
  };
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const statusColors = {
    UPCOMING: "bg-blue-900/20 text-blue-400",
    ONGOING: "bg-green-900/20 text-green-400",
    COMPLETED: "bg-gray-900/20 text-gray-400",
    CANCELLED: "bg-red-900/20 text-red-400",
  };

  return (
    <div className="overflow-hidden rounded-lg bg-gray-800 shadow-md transition-all hover:shadow-lg">
      <div className="relative h-40">
        {tournament.bannerImage ? (
          <img
            src={tournament.bannerImage}
            alt={tournament.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-700">
            <span className="text-xl font-bold text-gray-500">
              {tournament.name}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                statusColors[tournament.status]
              }`}
            >
              {tournament.status}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-400">
            {truncateText(tournament.description || "No description available", 100)}
          </p>
        </div>
        
        <div className="mb-4 flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Start Date</p>
            <p className="font-medium text-white">{formatDate(tournament.startDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">End Date</p>
            <p className="font-medium text-white">{formatDate(tournament.endDate)}</p>
          </div>
        </div>
        
        {tournament.status === "UPCOMING" && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Starts in</p>
            <p className="font-medium text-purple-400">
              {timeUntil(tournament.startDate)}
            </p>
          </div>
        )}
        
        {tournament.prizePool && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Prize Pool</p>
            <p className="font-bold text-purple-400">{tournament.prizePool}</p>
          </div>
        )}
        
        <div className="mt-4">
          <Link href={`/tournaments/${tournament.slug}`} passHref>
            <Button className="w-full">View Tournament</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}