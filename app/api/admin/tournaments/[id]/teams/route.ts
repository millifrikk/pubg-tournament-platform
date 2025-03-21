import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// Validation schema for adding a team to a tournament
const addTeamSchema = z.object({
  teamId: z.string(),
});

// Get teams in a tournament
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

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: { message: "Tournament not found" } },
        { status: 404 }
      );
    }

    // Get teams in the tournament
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { tournamentId: params.id },
      include: {
        team: true,
      },
    });

    return NextResponse.json({ success: true, data: tournamentTeams });
  } catch (error) {
    console.error(`Error fetching teams for tournament ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch tournament teams" } },
      { status: 500 }
    );
  }
}

// Add a team to a tournament
export async function POST(
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
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: { message: "Tournament not found" } },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = addTeamSchema.safeParse(body);

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

    const { teamId } = validationResult.data;

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: { message: "Team not found" } },
        { status: 404 }
      );
    }

    // Check if team is already in the tournament
    const existingTournamentTeam = await prisma.tournamentTeam.findFirst({
      where: {
        tournamentId: params.id,
        teamId,
      },
    });

    if (existingTournamentTeam) {
      return NextResponse.json(
        { success: false, error: { message: "Team is already in this tournament" } },
        { status: 409 }
      );
    }

    // Add team to tournament
    const tournamentTeam = await prisma.tournamentTeam.create({
      data: {
        tournamentId: params.id,
        teamId,
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json(
      { success: true, data: tournamentTeam },
      { status: 201 }
    );
  } catch (error) {
    console.error(`Error adding team to tournament ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to add team to tournament" } },
      { status: 500 }
    );
  }
}