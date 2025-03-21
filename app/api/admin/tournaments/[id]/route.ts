import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// Validation schema for updating a tournament
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

// Get a single tournament by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
        matches: {
          orderBy: {
            scheduledDate: "asc",
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: { message: "Tournament not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tournament });
  } catch (error) {
    console.error(`Error fetching tournament ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch tournament" } },
      { status: 500 }
    );
  }
}

// Update a tournament
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Check if tournament exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    });

    if (!existingTournament) {
      return NextResponse.json(
        { success: false, error: { message: "Tournament not found" } },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = tournamentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Validation error",
            details: validationResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { name, slug, description, startDate, endDate, status, bannerImage, prizePool, rules } = validationResult.data;

    // Check if slug is unique (unless it's the same as the existing tournament)
    if (slug !== existingTournament.slug) {
      const tournamentWithSlug = await prisma.tournament.findUnique({
        where: { slug },
      });

      if (tournamentWithSlug) {
        return NextResponse.json(
          {
            success: false,
            error: { message: "A tournament with this slug already exists" },
          },
          { status: 409 }
        );
      }
    }

    // Update the tournament
    const updatedTournament = await prisma.tournament.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        bannerImage,
        prizePool,
        rules,
      },
    });

    return NextResponse.json({ success: true, data: updatedTournament });
  } catch (error) {
    console.error(`Error updating tournament ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update tournament" } },
      { status: 500 }
    );
  }
}

// Delete a tournament
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Check if tournament exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            teams: true,
            matches: true,
          },
        },
      },
    });

    if (!existingTournament) {
      return NextResponse.json(
        { success: false, error: { message: "Tournament not found" } },
        { status: 404 }
      );
    }

    // Delete the tournament
    await prisma.tournament.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true, message: "Tournament deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting tournament ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete tournament" } },
      { status: 500 }
    );
  }
}