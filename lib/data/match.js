import { prisma } from "../db/prisma";

/**
 * Get all matches with optional filtering
 * @param {Object} options - Filter and pagination options
 * @param {Number} options.page - Page number for pagination (default: 1)
 * @param {Number} options.limit - Number of items per page (default: 10)
 * @param {String} options.tournamentId - Filter by tournament ID
 * @param {String} options.status - Filter by match status
 * @param {String} options.teamId - Filter by team ID (matches where team is participating)
 * @returns {Promise<Array>} - List of matches
 */
export async function getMatches(options = {}) {
  try {
    console.log('getMatches called with options:', options);
    
    const {
      page = 1,
      limit = 10,
      tournamentId,
      status,
      teamId,
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause based on provided filters
    const where = {};

    if (tournamentId) {
      where.tournamentId = tournamentId;
    }

    if (status) {
      where.status = status;
    }

    if (teamId) {
      where.OR = [
        { team1Id: teamId },
        { team2Id: teamId }
      ];
    }

    console.log('Prisma query where clause:', where);

    // Get matches with pagination
    const matches = await prisma.match.findMany({
      where,
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        team1: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        team2: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        winner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.match.count({ where });

    console.log(`Found ${matches.length} matches out of ${total} total`);

    return {
      data: matches,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error in getMatches:', error);
    throw error;
  }
}

/**
 * Get a single match by ID
 * @param {String} id - Match ID
 * @param {Boolean} includePlayerStats - Include player statistics (default: false)
 * @returns {Promise<Object>} - Match details
 */
export async function getMatch(id, includePlayerStats = false) {
  const include = {
    tournament: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    team1: {
      select: {
        id: true,
        name: true,
        logo: true,
      },
    },
    team2: {
      select: {
        id: true,
        name: true,
        logo: true,
      },
    },
    winner: {
      select: {
        id: true,
        name: true,
      },
    },
  };

  if (includePlayerStats) {
    include.playerStats = {
      include: {
        player: {
          select: {
            id: true,
            name: true,
            ingameId: true,
            teamId: true,
          },
        },
      },
    };
  }

  return prisma.match.findUnique({
    where: { id },
    include,
  });
}

/**
 * Create a new match
 * @param {Object} data - Match data
 * @returns {Promise<Object>} - Created match
 */
export async function createMatch(data) {
  try {
    console.log('Creating match with data:', data);
    return await prisma.match.create({
      data,
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
        team1: {
          select: {
            id: true,
            name: true,
          },
        },
        team2: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error in createMatch:', error);
    throw error;
  }
}

/**
 * Update an existing match
 * @param {String} id - Match ID
 * @param {Object} data - Updated match data
 * @returns {Promise<Object>} - Updated match
 */
export async function updateMatch(id, data) {
  return prisma.match.update({
    where: { id },
    data,
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
        },
      },
      team1: {
        select: {
          id: true,
          name: true,
        },
      },
      team2: {
        select: {
          id: true,
          name: true,
        },
      },
      winner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Update match status
 * @param {String} id - Match ID
 * @param {String} status - New status
 * @returns {Promise<Object>} - Updated match
 */
export async function updateMatchStatus(id, status) {
  const data = { status };
  
  // Add completedDate if status is completed
  if (status === 'completed') {
    data.completedDate = new Date();
  }

  return prisma.match.update({
    where: { id },
    data,
  });
}

/**
 * Delete a match
 * @param {String} id - Match ID
 * @returns {Promise<Object>} - Deleted match
 */
export async function deleteMatch(id) {
  return prisma.match.delete({
    where: { id },
  });
}

/**
 * Get matches for a tournament
 * @param {String} tournamentId - Tournament ID
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Array>} - List of matches
 */
export async function getTournamentMatches(tournamentId, options = {}) {
  return getMatches({
    ...options,
    tournamentId,
  });
}

/**
 * Get upcoming matches
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Array>} - List of upcoming matches
 */
export async function getUpcomingMatches(options = {}) {
  return getMatches({
    ...options,
    status: 'scheduled',
  });
}

/**
 * Get completed matches
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Array>} - List of completed matches
 */
export async function getCompletedMatches(options = {}) {
  return getMatches({
    ...options,
    status: 'completed',
  });
}

/**
 * Get matches for a team
 * @param {String} teamId - Team ID
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Array>} - List of matches
 */
export async function getTeamMatches(teamId, options = {}) {
  return getMatches({
    ...options,
    teamId,
  });
}
