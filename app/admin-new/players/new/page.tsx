"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/Button";
import Link from "next/link";

// Define form validation schema
const playerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ingameId: z.string().min(2, "In-game ID must be at least 2 characters"),
  teamId: z.string().optional().nullable(),
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface Team {
  id: string;
  name: string;
  slug: string;
}

export default function NewPlayerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: "",
      ingameId: "",
      teamId: "",
    },
  });

  // Fetch teams for dropdown
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
        console.error("Error loading teams:", err);
      } finally {
        setIsLoadingTeams(false);
      }
    }

    fetchTeams();
  }, []);

  const onSubmit = async (data: PlayerFormData) => {
    setIsLoading(true);
    setError(null);

    // Handle empty string for teamId (convert to null)
    if (data.teamId === "") {
      data.teamId = null;
    }

    try {
      const response = await fetch("/api/admin/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create player");
      }

      router.push("/admin-new/players");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Create New Player</h1>
          <Link href="/admin-new/players">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </header>

      <div className="rounded-lg bg-gray-800 p-6">
        {error && (
          <div className="mb-6 rounded-md bg-red-900/50 p-4 text-red-200">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300"
            >
              Player Name
            </label>
            <input
              id="name"
              {...register("name")}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="ingameId"
              className="block text-sm font-medium text-gray-300"
            >
              In-game ID
            </label>
            <input
              id="ingameId"
              {...register("ingameId")}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.ingameId && (
              <p className="mt-1 text-sm text-red-400">
                {errors.ingameId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="teamId"
              className="block text-sm font-medium text-gray-300"
            >
              Team (optional)
            </label>
            <select
              id="teamId"
              {...register("teamId")}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              disabled={isLoadingTeams}
            >
              <option value="">No Team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {errors.teamId && (
              <p className="mt-1 text-sm text-red-400">
                {errors.teamId.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Link href="/admin-new/players">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>
              Create Player
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}