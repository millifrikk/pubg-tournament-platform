import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

async function getDashboardData() {
  try {
    const [
      teamCount,
      playerCount,
      tournamentCount,
      upcomingTournamentCount,
      matchCount,
      userCount
    ] = await Promise.all([
      prisma.team.count(),
      prisma.player.count(),
      prisma.tournament.count(),
      prisma.tournament.count({
        where: { status: "UPCOMING" }
      }),
      prisma.match.count(),
      prisma.user.count()
    ]);
    
    return {
      teamCount,
      playerCount,
      tournamentCount,
      upcomingTournamentCount,
      matchCount,
      userCount
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      teamCount: 0,
      playerCount: 0,
      tournamentCount: 0,
      upcomingTournamentCount: 0,
      matchCount: 0,
      userCount: 0
    };
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData();
  
  const statCards = [
    {
      title: "Teams",
      value: data.teamCount,
      href: "/admin-new/teams",
      color: "bg-blue-800"
    },
    {
      title: "Players",
      value: data.playerCount,
      href: "/admin-new/players",
      color: "bg-purple-800"
    },
    {
      title: "Tournaments",
      value: data.tournamentCount,
      href: "/admin-new/tournaments",
      color: "bg-green-800"
    },
    {
      title: "Upcoming Tournaments",
      value: data.upcomingTournamentCount,
      href: "/admin-new/tournaments?status=UPCOMING",
      color: "bg-yellow-800"
    },
    {
      title: "Matches",
      value: data.matchCount,
      href: "/admin-new/matches",
      color: "bg-indigo-800"
    },
    {
      title: "Users",
      value: data.userCount,
      href: "/admin-new/users",
      color: "bg-red-800"
    }
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Manage your PUBG Tournament Platform
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`${card.color} rounded-lg p-6 transition-transform hover:scale-105`}
          >
            <h2 className="text-lg font-medium text-white">{card.title}</h2>
            <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/admin-new/teams/new"
              className="rounded-md bg-purple-600 px-4 py-3 text-center font-medium text-white hover:bg-purple-700"
            >
              Add New Team
            </Link>
            <Link
              href="/admin-new/players/new"
              className="rounded-md bg-purple-600 px-4 py-3 text-center font-medium text-white hover:bg-purple-700"
            >
              Add New Player
            </Link>
            <Link
              href="/admin-new/tournaments/new"
              className="rounded-md bg-purple-600 px-4 py-3 text-center font-medium text-white hover:bg-purple-700"
            >
              Create Tournament
            </Link>
            <Link
              href="/admin-new/matches/new"
              className="rounded-md bg-purple-600 px-4 py-3 text-center font-medium text-white hover:bg-purple-700"
            >
              Schedule Match
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="text-xl font-bold text-white">System Info</h2>
          <div className="mt-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Next.js Version
              </h3>
              <p className="text-white">15.2.2</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                React Version
              </h3>
              <p className="text-white">19.0.0</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Prisma Version
              </h3>
              <p className="text-white">6.5.0</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Environment
              </h3>
              <p className="text-white">
                {process.env.NODE_ENV || "development"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}