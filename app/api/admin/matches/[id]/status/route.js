import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { getMatch, updateMatchStatus } from "@/lib/data/match";

// Schema for status update
const updateStatusSchema = z.object({
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be one of: scheduled, in_progress, completed, cancelled",
  }),
});

// PUT /api/admin/matches/[id]/status - Update match status
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
      const { status } = updateStatusSchema.parse(body);

      // Update match status
      const updatedMatch = await updateMatchStatus(id, status);

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
    console.error("Error updating match status:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to update match status",
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
