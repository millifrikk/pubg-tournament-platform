"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button/Button";

interface Tournament {
  id: string;
  name: string;
  slug: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
}

interface Team {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface TournamentTeam {
  id: string;
  teamId: string;
  tournamentId: string;
  team: Team;
}

export default function ManageTournamentTeamsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [tournamentTeams, setTournamentTeams] = useState<TournamentTeam[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);

  // Fetch tournament and its teams
  useEffect(() => {
    async function fetchTournamentData() {
      try {
        const response = await fetch(`/api/admin/tournaments/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tournament");
        }
        
        const { data } = await response.json();
        setTournament(data);
        setTournamentTeams(data.teams || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTournamentData();
  }, [params.id]);

  // Fetch all teams
  const fetchAllTeams = async () => {
    try {
      const response = await fetch("/api/admin/teams");
      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }
      
      const { data } = await response.json();
      
      // Filter out teams that are already in the tournament
      const teamIds = tournamentTeams.map((tt) => tt.team.id);
      const availableTeams = data.filter((team: Team) => !teamIds.includes(team.id));
      
      setAllTeams(availableTeams);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  // Add team to tournament
  const addTeamToTournament = async (teamId: string) => {
    try {
      const response = await fetch(`/api/admin/tournaments/${params.id}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add team to tournament");
      }

      const { data } = await response.json();
      
      // Update tournament teams list
      setTournamentTeams((prevTeams) => [...prevTeams, data]);
      
      // Remove team from available teams list
      setAllTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Remove team from tournament
  const removeTeamFromTournament = async (tournamentTeamId: string, teamId: string) => {
    try {
      const response = await fetch(`/api/admin/tournaments/${params.id}/teams/${tournamentTeamId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove team from tournament");
      }

      // Update tournament teams list
      setTournamentTeams((prevTeams) => 
        prevTeams.filter((team) => team.id !== tournamentTeamId)
      );
      
      // If modal is open, add the team back to available teams
      if (showAddTeamModal) {
        const team = tournamentTeams.find((tt) => tt.id === tournamentTeamId)?.team;
        if (team) {
          setAllTeams((prevTeams) => [...prevTeams, team]);
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Handle opening the add team modal
  const handleOpenAddTeamModal = () => {
    fetchAllTeams();
    setShowAddTeamModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xl text-white">Loading tournament data...</p>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg bg-red-900/50 p-6 text-white">
          <h3 className="text-xl font-bold">Error</h3>
          <p className="mt-2">{error || "Tournament not found"}</p>
          <Button
            onClick={() => router.push("/admin-new/tournaments")}
            className="mt-4"
          >
            Back to Tournaments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
            <p className="text-gray-400">Manage tournament teams</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleOpenAddTeamModal}>Add Team</Button>
            <Link href={`/admin-new/tournaments/${params.id}`}>
              <Button variant="outline">Edit Tournament</Button>
            </Link>
            <Link href="/admin-new/tournaments">
              <Button variant="outline">Back to Tournaments</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Teams list */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Tournament Teams</h2>

        {tournamentTeams.length === 0 ? (
          <div className="rounded-lg bg-gray-700 p-8 text-center">
            <h3 className="text-lg font-medium text-white">
              No teams in this tournament
            </h3>
            <p className="mt-2 text-gray-400">
              Add teams to this tournament using the button below.
            </p>
            <Button onClick={handleOpenAddTeamModal} className="mt-4">
              Add Team
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {tournamentTeams.map((tournamentTeam) => (
              <div
                key={tournamentTeam.id}
                className="flex flex-col items-center rounded-lg bg-gray-700 p-4"
              >
                <div className="mb-3">
                  {tournamentTeam.team.logo ? (
                    <img
                      src={tournamentTeam.team.logo}
                      alt={tournamentTeam.team.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-700">
                      <span className="text-xl font-bold text-white">
                        {tournamentTeam.team.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="mb-1 text-lg font-medium text-white">
                  {tournamentTeam.team.name}
                </h3>
                <Link
                  href={`/admin-new/teams/${tournamentTeam.team.id}`}
                  className="mb-4 text-sm text-purple-400 hover:text-purple-300"
                >
                  View Team
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeTeamFromTournament(tournamentTeam.id, tournamentTeam.team.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-3xl rounded-lg bg-gray-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Add Team to Tournament</h3>
              <Button
                onClick={() => setShowAddTeamModal(false)}
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </div>

            {allTeams.length === 0 ? (
              <div className="rounded-lg bg-gray-700 p-8 text-center">
                <h3 className="text-lg font-medium text-white">
                  No teams available
                </h3>
                <p className="mt-2 text-gray-400">
                  All teams are already in this tournament or no teams exist.
                </p>
                <Link href="/admin-new/teams/new" className="mt-4 inline-block">
                  <Button>Create New Team</Button>
                </Link>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {allTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex flex-col items-center rounded-lg bg-gray-700 p-4"
                    >
                      <div className="mb-3">
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-700">
                            <span className="text-xl font-bold text-white">
                              {team.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="mb-1 text-lg font-medium text-white">
                        {team.name}
                      </h3>
                      <Link
                        href={`/admin-new/teams/${team.id}`}
                        className="mb-4 text-sm text-purple-400 hover:text-purple-300"
                      >
                        View Team
                      </Link>
                      <Button
                        onClick={() => addTeamToTournament(team.id)}
                        size="sm"
                      >
                        Add to Tournament
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddTeamModal(false)}
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