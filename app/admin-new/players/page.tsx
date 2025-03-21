"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button/Button";

interface Player {
  id: string;
  name: string;
  ingameId: string;
  teamId: string | null;
  team?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function PlayersAdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("/api/admin/players");
        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }
        const data = await response.json();
        setPlayers(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlayers();
  }, []);

  const handleDelete = async (playerId: string) => {
    if (!confirm("Are you sure you want to delete this player? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete player");
      }

      // Remove the player from the state
      setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== playerId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xl text-white">Loading players...</p>
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

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Players</h1>
          <p className="mt-2 text-gray-400">
            Create, edit, and delete players
          </p>
        </div>
        <Link href="/admin-new/players/new">
          <Button>Add New Player</Button>
        </Link>
      </header>

      {players.length === 0 ? (
        <div className="rounded-lg bg-gray-800 p-8 text-center">
          <h3 className="text-xl font-medium text-white">No players found</h3>
          <p className="mt-2 text-gray-400">
            Get started by creating your first player.
          </p>
          <Link href="/admin-new/players/new" className="mt-4 inline-block">
            <Button>Add New Player</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-gray-800">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Name
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  In-game ID
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Team
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-white">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 text-white">{player.ingameId}</td>
                  <td className="px-6 py-4">
                    {player.team ? (
                      <Link
                        href={`/admin-new/teams/${player.team.id}`}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        {player.team.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">No Team</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Link href={`/admin-new/players/${player.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(player.id)}
                      >
                        Delete
                      </Button>
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