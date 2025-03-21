import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/index";
import { getMatch, updateMatch, deleteMatch } from "@/lib/data/match";

// Schema for match updates
const updateMatchSchema = z.object({
  round: z.number().int().positive().optional(),
  matchNumber: z.number().int().positive().optional(),
  team1Id: z.string().optional(),
  team2Id: z.string().optional(),
  team1Score: z.number().int().min(0).optional(),
  team2Score: z.number().int().min(0).optional(),
  winnerId: z.string().optional().nullable(),
  scheduledDate: z.string().datetime().optional().nullable(),
  completedDate: z.string().datetime().optional().nullable(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
});

// GET /api/admin/matches/[id] - Get match details
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
    const includePlayerStats = request.nextUrl.searchParams.get('includePlayerStats') === 'true';
    
    // Get match details
    const match = await getMatch(id, includePlayerStats);
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: { message: "Match not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: match });
  } catch (error) {
    console.error("Error getting match:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to fetch match",
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/matches/[id] - Update a match
export async function PUT(request, { params }) {
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
    
    // Get the match to update
    const existingMatch = await getMatch(id);
    
    if (!existingMatch) {
      return NextResponse.json(
        { success: false, error: { message: "Match not found" } },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    try {
      const validatedData = updateMatchSchema.parse(body);
      
      // Handle date conversions
      if (validatedData.scheduledDate) {
        validatedData.scheduledDate = new Date(validatedData.scheduledDate);
      }
      
      if (validatedData.completedDate) {
        validatedData.completedDate = new Date(validatedData.completedDate);
      }

      // Update the match
      const updatedMatch = await updateMatch(id, validatedData);

      return NextResponse.json({ success: true, data: updatedMatch });
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
    console.error("Error updating match:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to update match",
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/matches/[id] - Delete a match
export async function DELETE(request, { params }) {
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
    
    // Get the match to delete
    const match = await getMatch(id);
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: { message: "Match not found" } },
        { status: 404 }
      );
    }

    // Delete the match
    await deleteMatch(id);

    return NextResponse.json(
      { success: true, data: { message: "Match deleted successfully" } }
    );
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to delete match",
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
