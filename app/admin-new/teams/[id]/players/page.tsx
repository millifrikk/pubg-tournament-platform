"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button/Button";

interface Team {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface Player {
  id: string;
  name: string;
  ingameId: string;
  teamId: string | null;
}

interface AvailablePlayer extends Player {
  inTeam: boolean;
}

export default function ManageTeamPlayersPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<AvailablePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

  // Fetch team and its players
  useEffect(() => {
    async function fetchTeamData() {
      try {
        const response = await fetch(`/api/admin/teams/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch team");
        }
        
        const { data } = await response.json();
        setTeam(data);
        setPlayers(data.players || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamData();
  }, [params.id]);

  // Fetch all available players
  const fetchAvailablePlayers = async () => {
    try {
      const response = await fetch("/api/admin/players");
      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }
      
      const { data } = await response.json();
      
      // Mark players that are already in the team
      const availablePlayers = data.map((player: Player) => ({
        ...player,
        inTeam: player.teamId === params.id,
      }));
      
      setAllPlayers(availablePlayers);
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  };

  // Add player to team
  const addPlayerToTeam = async (playerId: string) => {
    try {
      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId: params.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to add player to team");
      }

      const { data } = await response.json();
      
      // Update players list
      setPlayers((prevPlayers) => [...prevPlayers, data]);
      
      // Update available players list
      setAllPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === playerId ? { ...player, inTeam: true, teamId: params.id } : player
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Remove player from team
  const removePlayerFromTeam = async (playerId: string) => {
    try {
      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId: null }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove player from team");
      }

      // Update players list
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player.id !== playerId)
      );
      
      // Update available players list if modal is open
      setAllPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === playerId ? { ...player, inTeam: false, teamId: null } : player
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Handle opening the add player modal
  const handleOpenAddPlayerModal = () => {
    fetchAvailablePlayers();
    setShowAddPlayerModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xl text-white">Loading team data...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg bg-red-900/50 p-6 text-white">
          <h3 className="text-xl font-bold">Error</h3>
          <p className="mt-2">{error || "Team not found"}</p>
          <Button
            onClick={() => router.push("/admin-new/teams")}
            className="mt-4"
          >
            Back to Teams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {team.logo ? (
              <img
                src={team.logo}
                alt={team.name}
                className="mr-4 h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-700">
                <span className="text-lg font-bold text-white">
                  {team.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{team.name}</h1>
              <p className="text-gray-400">Manage team players</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleOpenAddPlayerModal}>Add Player</Button>
            <Link href={`/admin-new/teams/${params.id}`}>
              <Button variant="outline">Edit Team</Button>
            </Link>
            <Link href="/admin-new/teams">
              <Button variant="outline">Back to Teams</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Players list */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Team Players</h2>

        {players.length === 0 ? (
          <div className="rounded-lg bg-gray-700 p-8 text-center">
            <h3 className="text-lg font-medium text-white">
              No players in this team
            </h3>
            <p className="mt-2 text-gray-400">
              Add players to this team using the button below.
            </p>
            <Button onClick={handleOpenAddPlayerModal} className="mt-4">
              Add Player
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-gray-700">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-gray-300">
                    Player Name
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-300">
                    In-game ID
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-600/50">
                    <td className="px-6 py-4 font-medium text-white">
                      {player.name}
                    </td>
                    <td className="px-6 py-4 text-white">{player.ingameId}</td>
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
                          onClick={() => removePlayerFromTeam(player.id)}
                        >
                          Remove from Team
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

      {/* Add Player Modal */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-2xl rounded-lg bg-gray-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Add Player to Team</h3>
              <Button
                onClick={() => setShowAddPlayerModal(false)}
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {allPlayers.length === 0 ? (
                <p className="text-gray-400">Loading players...</p>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-sm font-medium text-gray-300">
                        Player Name
                      </th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-300">
                        In-game ID
                      </th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {allPlayers.map((player) => (
                      <tr key={player.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-2 font-medium text-white">
                          {player.name}
                        </td>
                        <td className="px-4 py-2 text-white">{player.ingameId}</td>
                        <td className="px-4 py-2">
                          {player.inTeam ? (
                            <span className="rounded-full bg-green-900/30 px-2 py-1 text-xs font-medium text-green-400">
                              In Team
                            </span>
                          ) : player.teamId ? (
                            <span className="rounded-full bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-400">
                              In Another Team
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-700 px-2 py-1 text-xs font-medium text-gray-400">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {player.inTeam ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removePlayerFromTeam(player.id)}
                            >
                              Remove
                            </Button>
                          ) : player.teamId ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addPlayerToTeam(player.id)}
                              title="This will move the player from their current team"
                            >
                              Transfer
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => addPlayerToTeam(player.id)}
                            >
                              Add
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddPlayerModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}