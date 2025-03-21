import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/index";
import { getMatch } from "@/lib/data/match";
import { getMatchPlayerStats, bulkUpsertPlayerStats } from "@/lib/data/playerStats";

// Schema for player stats
const playerStatSchema = z.object({
  playerId: z.string({
    required_error: "Player ID is required",
  }),
  kills: z.number({
    required_error: "Kills is required",
  }).int().min(0),
  deaths: z.number({
    required_error: "Deaths is required",
  }).int().min(0),
  assists: z.number({
    required_error: "Assists is required",
  }).int().min(0),
  damage: z.number({
    required_error: "Damage is required",
  }).min(0),
});

// Schema for bulk player stats update
const bulkPlayerStatsSchema = z.array(playerStatSchema);

// GET /api/admin/matches/[id]/player-stats - Get player stats for a match
export async function GET(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const id = params.id;
    
    // Check if match exists
    const match = await getMatch(id);
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: { message: "Match not found" } },
        { status: 404 }
      );
    }

    // Get player stats for the match
    const playerStats = await getMatchPlayerStats(id);

    return NextResponse.json({ success: true, data: playerStats });
  } catch (error) {
    console.error("Error getting player stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to fetch player statistics",
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/matches/[id]/player-stats - Create or update player stats
export async function POST(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const id = params.id;
    
    // Check if match exists
    const match = await getMatch(id);
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: { message: "Match not found" } },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    try {
      const validatedData = bulkPlayerStatsSchema.parse(body);
      
      // Bulk update player stats
      await bulkUpsertPlayerStats(id, validatedData);
      
      // Get updated player stats
      const updatedStats = await getMatchPlayerStats(id);

      return NextResponse.json({ success: true, data: updatedStats });
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Validation error",
            details: validationError.errors,
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating player stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to update player statistics",
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
