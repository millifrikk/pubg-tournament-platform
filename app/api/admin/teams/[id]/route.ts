import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// Validation schema for updating a team
const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
});

// Get a single team by ID
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

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        players: true,
        tournaments: {
          include: {
            tournament: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: { message: "Team not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error(`Error fetching team ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch team" } },
      { status: 500 }
    );
  }
}

// Update a team
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

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: params.id },
    });

    if (!existingTeam) {
      return NextResponse.json(
        { success: false, error: { message: "Team not found" } },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = teamSchema.safeParse(body);

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

    const { name, slug, description, logo } = validationResult.data;

    // Check if slug is unique (unless it's the same as the existing team)
    if (slug !== existingTeam.slug) {
      const teamWithSlug = await prisma.team.findUnique({
        where: { slug },
      });

      if (teamWithSlug) {
        return NextResponse.json(
          {
            success: false,
            error: { message: "A team with this slug already exists" },
          },
          { status: 409 }
        );
      }
    }

    // Update the team
    const updatedTeam = await prisma.team.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        logo,
      },
    });

    return NextResponse.json({ success: true, data: updatedTeam });
  } catch (error) {
    console.error(`Error updating team ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update team" } },
      { status: 500 }
    );
  }
}

// Delete a team
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

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            players: true,
            tournaments: true,
          },
        },
      },
    });

    if (!existingTeam) {
      return NextResponse.json(
        { success: false, error: { message: "Team not found" } },
        { status: 404 }
      );
    }

    // Delete the team
    await prisma.team.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true, message: "Team deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting team ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete team" } },
      { status: 500 }
    );
  }
}