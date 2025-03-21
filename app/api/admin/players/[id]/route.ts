import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// Validation schema for updating a player
const playerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ingameId: z.string().min(2, "In-game ID must be at least 2 characters"),
  teamId: z.string().nullable().optional(),
});

// Get a single player by ID
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

    const player = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        stats: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        { success: false, error: { message: "Player not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    console.error(`Error fetching player ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch player" } },
      { status: 500 }
    );
  }
}

// Update a player
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

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { id: params.id },
    });

    if (!existingPlayer) {
      return NextResponse.json(
        { success: false, error: { message: "Player not found" } },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = playerSchema.safeParse(body);

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

    const { name, ingameId, teamId } = validationResult.data;

    // If teamId is provided, check if team exists
    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        return NextResponse.json(
          { success: false, error: { message: "Team not found" } },
          { status: 404 }
        );
      }
    }

    // Update the player
    const updatedPlayer = await prisma.player.update({
      where: { id: params.id },
      data: {
        name,
        ingameId,
        teamId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedPlayer });
  } catch (error) {
    console.error(`Error updating player ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update player" } },
      { status: 500 }
    );
  }
}

// Delete a player
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

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { id: params.id },
    });

    if (!existingPlayer) {
      return NextResponse.json(
        { success: false, error: { message: "Player not found" } },
        { status: 404 }
      );
    }

    // Delete the player
    await prisma.player.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true, message: "Player deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting player ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete player" } },
      { status: 500 }
    );
  }
}