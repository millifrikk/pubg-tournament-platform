"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/Button";
import Link from "next/link";
import { slugify } from "@/lib/utils";

// Define the form validation schema
const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  players?: Array<{
    id: string;
    name: string;
    ingameId: string;
  }>;
}

export default function EditTeamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      logo: "",
    },
  });

  // Watch the name field to auto-generate slug
  const nameValue = watch("name");
  
  // Update slug when name changes
  const updateSlug = () => {
    if (nameValue && !team) { // Only auto-update slug for new teams
      setValue("slug", slugify(nameValue));
    }
  };

  // Fetch team data
  useEffect(() => {
    async function fetchTeam() {
      try {
        const response = await fetch(`/api/admin/teams/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch team");
        }
        
        const { data } = await response.json();
        setTeam(data);
        
        // Set form values
        reset({
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          logo: data.logo || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsFetching(false);
      }
    }

    fetchTeam();
  }, [params.id, reset]);

  const onSubmit = async (data: TeamFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/teams/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to update team");
      }

      router.push("/admin-new/teams");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xl text-white">Loading team data...</p>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg bg-red-900/50 p-6 text-white">
          <h3 className="text-xl font-bold">Error</h3>
          <p className="mt-2">{error}</p>
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
          <h1 className="text-3xl font-bold text-white">Edit Team</h1>
          <div className="flex space-x-2">
            <Link href={`/admin-new/teams/${params.id}/players`}>
              <Button variant="outline">Manage Players</Button>
            </Link>
            <Link href="/admin-new/teams">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Team Name
            </label>
            <input
              id="name"
              {...register("name")}
              onBlur={updateSlug}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-300">
              Slug (URL-friendly name)
            </label>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-700 bg-gray-800 px-3 text-gray-400 sm:text-sm">
                /teams/
              </span>
              <input
                id="slug"
                {...register("slug")}
                className="block w-full rounded-none rounded-r-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-400">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-300">
              Logo URL (optional)
            </label>
            <input
              id="logo"
              type="url"
              {...register("logo")}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.logo && (
              <p className="mt-1 text-sm text-red-400">{errors.logo.message}</p>
            )}
            {watch("logo") && (
              <div className="mt-2">
                <p className="text-sm text-gray-400">Logo preview:</p>
                <img
                  src={watch("logo") || ""}
                  alt="Logo preview"
                  className="mt-1 h-16 w-16 rounded-full object-cover bg-gray-700"
                  onError={(e) => (e.currentTarget.src = "")}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description (optional)
            </label>
            <textarea
              id="description"
              rows={4}
              {...register("description")}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Link href="/admin-new/teams">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>
              Update Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}