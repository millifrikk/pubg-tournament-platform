interface TeamStatsProps {
  stats: {
    totalMatches?: number;
    wins?: number;
    losses?: number;
    upcomingMatches?: number;
    totalPlayers?: number;
    totalTournaments?: number;
  };
}

export default function TeamStats({ stats }: TeamStatsProps) {
  const statItems = [
    {
      label: "Total Matches",
      value: stats.totalMatches ?? 0,
    },
    {
      label: "Wins",
      value: stats.wins ?? 0,
    },
    {
      label: "Losses",
      value: stats.losses ?? 0,
    },
    {
      label: "Win Rate",
      value: stats.totalMatches && stats.wins 
        ? `${Math.round((stats.wins / stats.totalMatches) * 100)}%` 
        : "N/A",
    },
    {
      label: "Upcoming Matches",
      value: stats.upcomingMatches ?? 0,
    },
    {
      label: "Team Size",
      value: stats.totalPlayers ?? 0,
    },
    {
      label: "Tournaments",
      value: stats.totalTournaments ?? 0,
    },
  ];

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <h3 className="mb-4 text-lg font-bold text-white">Team Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {statItems.map((item) => (
          <div key={item.label} className="rounded-md bg-gray-700 p-3 text-center">
            <div className="text-2xl font-bold text-white">{item.value}</div>
            <div className="text-sm text-gray-400">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}