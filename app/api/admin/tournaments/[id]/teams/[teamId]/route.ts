import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";

// Get a specific team in a tournament
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; teamId: string } }
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

    // Get the tournament team
    const tournamentTeam = await prisma.tournamentTeam.findFirst({
      where: {
        id: params.teamId,
        tournamentId: params.id,
      },
      include: {
        team: {
          include: {
            players: true,
          },
        },
      },
    });

    if (!tournamentTeam) {
      return NextResponse.json(
        { success: false, error: { message: "Tournament team not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tournamentTeam });
  } catch (error) {
    console.error(`Error fetching tournament team ${params.teamId}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch tournament team" } },
      { status: 500 }
    );
  }
}

// Remove a team from a tournament
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; teamId: string } }
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

    // Check if the tournament team exists
    const tournamentTeam = await prisma.tournamentTeam.findFirst({
      where: {
        id: params.teamId,
        tournamentId: params.id,
      },
    });

    if (!tournamentTeam) {
      return NextResponse.json(
        { success: false, error: { message: "Tournament team not found" } },
        { status: 404 }
      );
    }

    // Delete the tournament team
    await prisma.tournamentTeam.delete({
      where: {
        id: params.teamId,
      },
    });

    return NextResponse.json(
      { success: true, message: "Team removed from tournament successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error removing team from tournament ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to remove team from tournament" } },
      { status: 500 }
    );
  }
}