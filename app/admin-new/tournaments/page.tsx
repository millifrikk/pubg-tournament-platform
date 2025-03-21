"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button/Button";
import { formatDate } from "@/lib/utils";

interface Tournament {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  bannerImage?: string | null;
  prizePool?: string | null;
  _count?: {
    teams?: number;
    matches?: number;
  };
}

export default function TournamentsAdminPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const response = await fetch("/api/admin/tournaments");
        if (!response.ok) {
          throw new Error("Failed to fetch tournaments");
        }
        const data = await response.json();
        setTournaments(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTournaments();
  }, []);

  const handleDelete = async (tournamentId: string) => {
    if (!confirm("Are you sure you want to delete this tournament? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tournaments/${tournamentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete tournament");
      }

      // Remove the tournament from the state
      setTournaments((prevTournaments) => prevTournaments.filter((tournament) => tournament.id !== tournamentId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xl text-white">Loading tournaments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg bg-red-900/50 p-6 text-white">
          <h3 className="text-xl font-bold">Error</h3>
          <p className="mt-2">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: Tournament["status"]) => {
    const statusColors = {
      UPCOMING: "bg-blue-900/20 text-blue-400 border-blue-800",
      ONGOING: "bg-green-900/20 text-green-400 border-green-800",
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
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Tournaments</h1>
          <p className="mt-2 text-gray-400">
            Create, edit, and manage tournaments
          </p>
        </div>
        <Link href="/admin-new/tournaments/new">
          <Button>Create Tournament</Button>
        </Link>
      </header>

      {tournaments.length === 0 ? (
        <div className="rounded-lg bg-gray-800 p-8 text-center">
          <h3 className="text-xl font-medium text-white">No tournaments found</h3>
          <p className="mt-2 text-gray-400">
            Get started by creating your first tournament.
          </p>
          <Link href="/admin-new/tournaments/new" className="mt-4 inline-block">
            <Button>Create Tournament</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-gray-800">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Tournament
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Dates
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Teams
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Matches
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {tournaments.map((tournament) => (
                <tr key={tournament.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {tournament.bannerImage ? (
                          <img
                            src={tournament.bannerImage}
                            alt={tournament.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-purple-700">
                            <span className="text-sm font-bold text-white">
                              {tournament.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-white">{tournament.name}</div>
                        <div className="text-sm text-gray-400">{tournament.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">
                    <div className="text-sm">{formatDate(tournament.startDate)}</div>
                    <div className="text-sm text-gray-400">to</div>
                    <div className="text-sm">{formatDate(tournament.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 text-white">
                    {getStatusBadge(tournament.status)}
                  </td>
                  <td className="px-6 py-4 text-white">
                    {tournament._count?.teams || 0}
                  </td>
                  <td className="px-6 py-4 text-white">
                    {tournament._count?.matches || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Link href={`/admin-new/tournaments/${tournament.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(tournament.id)}
                      >
                        Delete
                      </Button>
                      <Link href={`/admin-new/tournaments/${tournament.id}/teams`}>
                        <Button variant="ghost" size="sm">
                          Teams
                        </Button>
                      </Link>
                      <Link href={`/admin-new/tournaments/${tournament.id}/matches`}>
                        <Button variant="ghost" size="sm">
                          Matches
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}