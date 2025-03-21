import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// Validation schema for creating/updating a tournament
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

// Get all tournaments
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

    const tournaments = await prisma.tournament.findMany({
      include: {
        _count: {
          select: {
            teams: true,
            matches: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json({ success: true, data: tournaments });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch tournaments" } },
      { status: 500 }
    );
  }
}

// Create a new tournament
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

    // Check if a tournament with the same slug already exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { slug },
    });

    if (existingTournament) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "A tournament with this slug already exists" },
        },
        { status: 409 }
      );
    }

    // Create the tournament
    const tournament = await prisma.tournament.create({
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

    return NextResponse.json(
      { success: true, data: tournament },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tournament:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create tournament" } },
      { status: 500 }
    );
  }
}