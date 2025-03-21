import Link from "next/link";
import { truncateText } from "@/lib/utils";
import { Button } from "@/components/ui/button/Button";

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    description?: string | null;
    _count?: {
      players?: number;
    };
  };
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-gray-800 shadow-md transition-all hover:shadow-lg">
      <div className="flex items-center justify-center p-6">
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-700">
            <span className="text-xl font-bold text-white">
              {team.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 text-center">
        <h3 className="mb-2 text-xl font-bold text-white">{team.name}</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-400">
            {truncateText(team.description || "No description available", 100)}
          </p>
        </div>
        
        {team._count?.players !== undefined && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Players</p>
            <p className="font-medium text-white">{team._count.players}</p>
          </div>
        )}
        
        <div className="mt-4">
          <Link href={`/teams/${team.slug}`} passHref>
            <Button className="w-full">View Team</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}