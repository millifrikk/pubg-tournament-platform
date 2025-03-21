"use client";

import { useState } from "react";
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
  description: z.string().optional(),
  logo: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

export default function NewTeamPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
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
    if (nameValue) {
      setValue("slug", slugify(nameValue));
    }
  };

  const onSubmit = async (data: TeamFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create team");
      }

      router.push("/admin-new/teams");
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
          <h1 className="text-3xl font-bold text-white">Create New Team</h1>
          <Link href="/admin-new/teams">
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
              Create Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}