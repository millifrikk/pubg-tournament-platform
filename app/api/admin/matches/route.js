import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/index";
import { getMatches, createMatch } from "@/lib/data/match";

// Schema for match creation
const createMatchSchema = z.object({
  tournamentId: z.string({
    required_error: "Tournament ID is required",
  }),
  round: z.number({
    required_error: "Round is required",
  }).int().positive(),
  matchNumber: z.number({
    required_error: "Match number is required",
  }).int().positive(),
  team1Id: z.string({
    required_error: "Team 1 ID is required",
  }),
  team2Id: z.string({
    required_error: "Team 2 ID is required",
  }),
  scheduledDate: z.string().datetime().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"])
    .default("scheduled"),
}).refine(data => data.team1Id !== data.team2Id, {
  message: "Team 1 and Team 2 cannot be the same team",
  path: ["team2Id"],
});

// GET /api/admin/matches - List all matches
export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")) : 10;
    const tournamentId = searchParams.get("tournamentId");
    const status = searchParams.get("status");
    const teamId = searchParams.get("teamId");

    console.log("Fetching matches with params:", { page, limit, tournamentId, status, teamId });

    // Get matches with filtering
    const result = await getMatches({
      page,
      limit,
      tournamentId,
      status,
      teamId,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error getting matches:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to fetch matches",
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/matches - Create a new match
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    try {
      const validatedData = createMatchSchema.parse(body);
      
      // Handle date conversion
      if (validatedData.scheduledDate) {
        validatedData.scheduledDate = new Date(validatedData.scheduledDate);
      }

  // Create the match
      try {
        const match = await createMatch(validatedData);

        return NextResponse.json(
          { success: true, data: match },
          { status: 201 }
        );
      } catch (createError) {
        // Check for unique constraint violation
        if (createError.code === 'P2002') {
          return NextResponse.json(
            {
              success: false,
              error: {
                message: "A match with this tournament, round, and match number already exists",
                details: "Please use a different combination",
              },
            },
            { status: 409 } // Conflict
          );
        }
        
        throw createError; // Re-throw other errors
      }
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
    console.error("Error creating match:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to create match",
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
