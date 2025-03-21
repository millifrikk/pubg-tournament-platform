import { notFound } from "next/navigation";
import { getTeamBySlug, getTeamMatches } from "@/lib/data/teams";
import TeamStats from "@/components/team/TeamStats";
import TeamAchievements from "@/components/team/TeamAchievements";
import MatchList from "@/components/match/MatchList";
import FollowButton from "@/components/ui/FollowButton";

interface TeamPageProps {
  params: {
    slug: string;
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const team = await getTeamBySlug(params.slug);
  
  if (!team) {
    notFound();
  }
  
  const matches = await getTeamMatches(team.id);
  
  // Calculate team stats
  const stats = {
    totalMatches: matches.length,
    wins: matches.filter(match => match.winnerId === team.id).length,
    losses: matches.filter(match => 
      match.status === "COMPLETED" && match.winnerId !== team.id
    ).length,
    upcomingMatches: matches.filter(match => match.status === "SCHEDULED").length,
    totalPlayers: team.players.length,
    totalTournaments: team.tournaments.length,
  };
  
  // Sample achievements (in a real app, these would come from the database)
  const achievements = [
    {
      id: "1",
      title: "Tournament Champion",
      description: "Won the PUBG Summer Invitational 2024",
      date: "July 2024",
    },
    {
      id: "2",
      title: "Most Valuable Team",
      description: "Awarded for exceptional performance during the Spring League",
      date: "May 2024",
    },
  ];
  
  return (
    <div className="bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Team Header */}
        <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-6">
            {/* Team Logo */}
            {team.logo ? (
              <img
                src={team.logo}
                alt={team.name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-700">
                <span className="text-3xl font-bold text-white">
                  {team.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Team Info */}
            <div>
              <h1 className="text-3xl font-bold text-white">{team.name}</h1>
              <p className="mt-2 text-gray-400">
                {team.description || "No team description available."}
              </p>
            </div>
          </div>
          
          {/* Follow Button */}
          <FollowButton entityId={team.id} entityType="TEAM" />
        </div>
        
        {/* Team Statistics */}
        <div className="mb-8">
          <TeamStats stats={stats} />
        </div>
        
        {/* Team Players */}
        <div className="mb-8 rounded-lg bg-gray-800 p-4">
          <h3 className="mb-4 text-lg font-bold text-white">Team Roster</h3>
          
          {team.players.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No players on this team yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {team.players.map((player) => (
                <div key={player.id} className="rounded-md bg-gray-700 p-4">
                  <h4 className="font-bold text-white">{player.name}</h4>
                  <p className="text-sm text-gray-400">In-game ID: {player.ingameId}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Team Matches */}
          <div>
            <MatchList
              matches={matches}
              title="Recent Matches"
              emptyMessage="No matches found for this team."
            />
          </div>
          
          {/* Team Achievements */}
          <div>
            <TeamAchievements achievements={achievements} />
          </div>
        </div>
      </div>
    </div>
  );
}