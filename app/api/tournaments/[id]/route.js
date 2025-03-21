// app/api/tournaments/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { uploadToS3 } from '@/lib/s3-upload';

// Get all tournaments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Build query conditions
    const where = {};
    if (status) {
      where.status = status;
    }
    
    // Get tournaments with counts
    const [tournaments, total] = await Promise.all([
      db.tournament.findMany({
        where,
        include: {
          matches: {
            include: {
              team1: true,
              team2: true,
            },
            take: 1, // Just to check if there are any
          },
          _count: {
            select: {
              matches: true,
            }
          }
        },
        orderBy: {
          startDate: 'desc',
        },
        skip,
        take: limit,
      }),
      db.tournament.count({ where }),
    ]);
    
    // Transform data for response
    const data = tournaments.map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      slug: tournament.slug,
      description: tournament.description,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      prizePool: tournament.prizePool,
      format: tournament.format,
      bannerImage: tournament.bannerImage,
      status: tournament.status,
      matchCount: tournament._count.matches,
      hasMatches: tournament.matches.length > 0,
      createdAt: tournament.createdAt,
      updatedAt: tournament.updatedAt,
    }));
    
    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // Return formatted response
    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      }
    });
    
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}

// Create a new tournament
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check authorization
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const formData = await request.formData();
    
    // Extract and validate tournament data
    const name = formData.get('name');
    const slug = formData.get('slug');
    const description = formData.get('description');
    const startDate = new Date(formData.get('startDate'));
    const endDate = new Date(formData.get('endDate'));
    const prizePool = formData.get('prizePool');
    const format = formData.get('format');
    const rules = formData.get('rules');
    const status = formData.get('status');
    const teamsJson = formData.get('teams');
    
    // Validate required fields
    if (!name || !slug || !startDate || !endDate || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate slug is unique
    const existingTournament = await db.tournament.findUnique({
      where: { slug },
    });
    
    if (existingTournament) {
      return NextResponse.json(
        { error: 'A tournament with this slug already exists' },
        { status: 400 }
      );
    }
    
    // Process banner image if provided
    let bannerImageUrl = null;
    const bannerImage = formData.get('bannerImage');
    
    if (bannerImage) {
      const file = bannerImage;
      if (typeof file !== 'string') {
        bannerImageUrl = await uploadToS3(file, `tournaments/${slug}/banner`);
      }
    }
    
    // Parse teams if provided
    let teamConnections = [];
    if (teamsJson) {
      try {
        const teamIds = JSON.parse(teamsJson);
        if (Array.isArray(teamIds)) {
          teamConnections = teamIds.map(id => ({ id }));
        }
      } catch (error) {
        console.error('Error parsing teams JSON:', error);
      }
    }
    
    // Create the tournament
    const tournament = await db.tournament.create({
      data: {
        name,
        slug,
        description,
        startDate,
        endDate,
        prizePool,
        format,
        rules,
        status,
        bannerImage: bannerImageUrl,
        ...(teamConnections.length > 0 && {
          teams: {
            connect: teamConnections,
          },
        }),
      },
      include: {
        teams: true,
      },
    });
    
    return NextResponse.json(tournament, { status: 201 });
    
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}

// app/api/tournaments/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { uploadToS3, deleteFromS3 } from '@/lib/s3-upload';

// Get a specific tournament by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const tournament = await db.tournament.findUnique({
      where: { id },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            country: true,
          },
        },
        matches: {
          include: {
            team1: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                country: true,
              },
            },
            team2: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                country: true,
              },
            },
          },
          orderBy: {
            dateTime: 'asc',
          },
        },
      },
    });
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(tournament);
    
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}

// Update a tournament
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check authorization
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Check if tournament exists
    const existingTournament = await db.tournament.findUnique({
      where: { id },
    });
    
    if (!existingTournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    const formData = await request.formData();
    
    // Extract and validate tournament data
    const name = formData.get('name');
    const slug = formData.get('slug');
    const description = formData.get('description');
    const startDate = formData.get('startDate') ? new Date(formData.get('startDate')) : undefined;
    const endDate = formData.get('endDate') ? new Date(formData.get('endDate')) : undefined;
    const prizePool = formData.get('prizePool');
    const format = formData.get('format');
    const rules = formData.get('rules');
    const status = formData.get('status');
    const teamsJson = formData.get('teams');
    
    // Validate required fields
    if (!name || !slug || !startDate || !endDate || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if slug is being changed and if it's unique
    if (slug !== existingTournament.slug) {
      const slugExists = await db.tournament.findUnique({
        where: { slug },
      });
      
      if (slugExists) {
        return NextResponse.json(
          { error: 'A tournament with this slug already exists' },
          { status: 400 }
        );
      }
    }
    
    // Process banner image if provided
    let bannerImageUrl = existingTournament.bannerImage;
    const bannerImage = formData.get('bannerImage');
    
    if (bannerImage) {
      if (typeof bannerImage !== 'string') {
        // If there's an existing image, delete it first
        if (existingTournament.bannerImage) {
          try {
            await deleteFromS3(existingTournament.bannerImage);
          } catch (error) {
            console.error('Error deleting old banner image:', error);
          }
        }
        
        // Upload new image
        bannerImageUrl = await uploadToS3(bannerImage, `tournaments/${slug}/banner`);
      }
    }
    
    // Parse teams if provided
    let teamConnections = [];
    let teamDisconnections = [];
    
    if (teamsJson) {
      try {
        const newTeamIds = JSON.parse(teamsJson);
        
        if (Array.isArray(newTeamIds)) {
          // Get current teams
          const currentTeams = await db.tournament.findUnique({
            where: { id },
            select: {
              teams: {
                select: {
                  id: true,
                },
              },
            },
          });
          
          const currentTeamIds = currentTeams.teams.map(team => team.id);
          
          // Teams to add
          const teamsToAdd = newTeamIds.filter(teamId => !currentTeamIds.includes(teamId));
          teamConnections = teamsToAdd.map(id => ({ id }));
          
          // Teams to remove
          const teamsToRemove = currentTeamIds.filter(teamId => !newTeamIds.includes(teamId));
          teamDisconnections = teamsToRemove.map(id => ({ id }));
        }
      } catch (error) {
        console.error('Error parsing teams JSON:', error);
      }
    }
    
    // Update the tournament
    const tournament = await db.tournament.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        startDate,
        endDate,
        prizePool,
        format,
        rules,
        status,
        bannerImage: bannerImageUrl,
        ...(teamConnections.length > 0 && {
          teams: {
            connect: teamConnections,
          },
        }),
        ...(teamDisconnections.length > 0 && {
          teams: {
            disconnect: teamDisconnections,
          },
        }),
      },
      include: {
        teams: true,
      },
    });
    
    return NextResponse.json(tournament);
    
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    );
  }
}

// Delete a tournament
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check authorization
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only administrators can delete tournaments' },
        { status: 403 }
      );
    }
    
    // Check if tournament exists
    const tournament = await db.tournament.findUnique({
      where: { id },
    });
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    // First delete related matches
    await db.match.deleteMany({
      where: { tournamentId: id },
    });
    
    // Delete tournament
    await db.tournament.delete({
      where: { id },
    });
    
    // Delete banner image from S3 if exists
    if (tournament.bannerImage) {
      try {
        await deleteFromS3(tournament.bannerImage);
      } catch (error) {
        console.error('Error deleting banner image:', error);
      }
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    );
  }
}