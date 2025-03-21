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
const tournamentSchema = z.object({
  name: z.string().min(2, "Tournament name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional().nullable(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Start date must be a valid date",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "End date must be a valid date",
  }),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]),
  bannerImage: z.string().optional().nullable(),
  prizePool: z.string().optional().nullable(),
  rules: z.string().optional().nullable(),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return startDate <= endDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type TournamentFormData = z.infer<typeof tournamentSchema>;

export default function NewTournamentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      startDate: new Date().toISOString().slice(0, 10), // Today's date
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 days from now
      status: "UPCOMING",
      bannerImage: "",
      prizePool: "",
      rules: "",
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

  const onSubmit = async (data: TournamentFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create tournament");
      }

      router.push("/admin-new/tournaments");
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
          <h1 className="text-3xl font-bold text-white">Create New Tournament</h1>
          <Link href="/admin-new/tournaments">
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
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Tournament Name
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
                  /tournaments/
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
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              {...register("description")}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                {...register("startDate")}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-400">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                {...register("endDate")}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-400">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                Status
              </label>
              <select
                id="status"
                {...register("status")}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-400">{errors.status.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="prizePool" className="block text-sm font-medium text-gray-300">
                Prize Pool (optional)
              </label>
              <input
                id="prizePool"
                {...register("prizePool")}
                placeholder="e.g. $10,000"
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
              {errors.prizePool && (
                <p className="mt-1 text-sm text-red-400">{errors.prizePool.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-300">
              Banner Image URL (optional)
            </label>
            <input
              id="bannerImage"
              type="url"
              {...register("bannerImage")}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.bannerImage && (
              <p className="mt-1 text-sm text-red-400">{errors.bannerImage.message}</p>
            )}
            {watch("bannerImage") && (
              <div className="mt-2">
                <p className="text-sm text-gray-400">Banner preview:</p>
                <img
                  src={watch("bannerImage") || ""}
                  alt="Banner preview"
                  className="mt-1 h-32 w-full rounded object-cover bg-gray-700"
                  onError={(e) => (e.currentTarget.src = "")}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="rules" className="block text-sm font-medium text-gray-300">
              Tournament Rules (optional, supports HTML)
            </label>
            <textarea
              id="rules"
              rows={6}
              {...register("rules")}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.rules && (
              <p className="mt-1 text-sm text-red-400">{errors.rules.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Link href="/admin-new/tournaments">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>
              Create Tournament
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}