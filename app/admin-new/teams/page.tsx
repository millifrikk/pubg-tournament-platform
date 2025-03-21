"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";

interface Team {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  _count?: {
    players?: number;
    tournaments?: number;
  };
}

export default function TeamsAdminPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch("/api/admin/teams");
        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }
        const data = await response.json();
        setTeams(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeams();
  }, []);

  const handleDelete = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete team");
      }

      // Remove the team from the state
      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xl text-white">Loading teams...</p>
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
          <h1 className="text-3xl font-bold text-white">Manage Teams</h1>
          <p className="mt-2 text-gray-400">
            Create, edit, and delete teams
          </p>
        </div>
        <Link href="/admin-new/teams/new">
          <Button>Add New Team</Button>
        </Link>
      </header>

      {teams.length === 0 ? (
        <div className="rounded-lg bg-gray-800 p-8 text-center">
          <h3 className="text-xl font-medium text-white">No teams found</h3>
          <p className="mt-2 text-gray-400">
            Get started by creating your first team.
          </p>
          <Link href="/admin-new/teams/new" className="mt-4 inline-block">
            <Button>Add New Team</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-gray-800">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Team
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Players
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Tournaments
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-700">
                            <span className="text-sm font-bold text-white">
                              {team.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-white">{team.name}</div>
                        <div className="text-sm text-gray-400">{team.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">
                    {team._count?.players || 0}
                  </td>
                  <td className="px-6 py-4 text-white">
                    {team._count?.tournaments || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Link href={`/admin-new/teams/${team.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(team.id)}
                      >
                        Delete
                      </Button>
                      <Link href={`/admin-new/teams/${team.id}/players`}>
                        <Button variant="ghost" size="sm">
                          Manage Players
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