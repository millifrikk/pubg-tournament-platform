import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// Validation schema for creating/updating a team
const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
});

// Get all teams
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: {
            players: true,
            tournaments: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ success: true, data: teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch teams" } },
      { status: 500 }
    );
  }
}

// Create a new team
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
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

    // Check if a team with the same slug already exists
    const existingTeam = await prisma.team.findUnique({
      where: { slug },
    });

    if (existingTeam) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "A team with this slug already exists" },
        },
        { status: 409 }
      );
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        name,
        slug,
        description,
        logo,
      },
    });

    return NextResponse.json(
      { success: true, data: team },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create team" } },
      { status: 500 }
    );
  }
}