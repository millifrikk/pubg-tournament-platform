import { prisma } from "../db/prisma";

/**
 * Get player statistics for a match
 * @param {String} matchId - Match ID
 * @returns {Promise<Array>} - Player statistics for the match
 */
export async function getMatchPlayerStats(matchId) {
  return prisma.playerStats.findMany({
    where: { matchId },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          ingameId: true,
          teamId: true,
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      { kills: 'desc' },
      { damage: 'desc' },
    ],
  });
}

/**
 * Get player statistics for a specific player in a match
 * @param {String} matchId - Match ID
 * @param {String} playerId - Player ID
 * @returns {Promise<Object>} - Player statistics
 */
export async function getPlayerMatchStats(matchId, playerId) {
  return prisma.playerStats.findUnique({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          ingameId: true,
          teamId: true,
        },
      },
      match: {
        select: {
          id: true,
          tournamentId: true,
          round: true,
          matchNumber: true,
        },
      },
    },
  });
}

/**
 * Create or update player statistics for a match
 * @param {String} matchId - Match ID
 * @param {String} playerId - Player ID
 * @param {Object} data - Player statistics data
 * @returns {Promise<Object>} - Updated player statistics
 */
export async function upsertPlayerStats(matchId, playerId, data) {
  return prisma.playerStats.upsert({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
    update: data,
    create: {
      matchId,
      playerId,
      ...data,
    },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          ingameId: true,
        },
      },
    },
  });
}

/**
 * Bulk create or update player statistics for a match
 * @param {String} matchId - Match ID
 * @param {Array} stats - Array of player statistics objects
 * @returns {Promise<Array>} - Updated player statistics
 */
export async function bulkUpsertPlayerStats(matchId, stats) {
  // Create transactions for all upsert operations
  const operations = stats.map(stat => {
    const { playerId, ...data } = stat;
    
    return prisma.playerStats.upsert({
      where: {
        matchId_playerId: {
          matchId,
          playerId,
        },
      },
      update: data,
      create: {
        matchId,
        playerId,
        ...data,
      },
    });
  });

  // Execute all operations in a transaction
  return prisma.$transaction(operations);
}

/**
 * Delete player statistics
 * @param {String} matchId - Match ID
 * @param {String} playerId - Player ID
 * @returns {Promise<Object>} - Deleted player statistics
 */
export async function deletePlayerStats(matchId, playerId) {
  return prisma.playerStats.delete({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
  });
}

/**
 * Get player tournament statistics (aggregated across all matches in a tournament)
 * @param {String} tournamentId - Tournament ID
 * @param {String} playerId - Player ID
 * @returns {Promise<Object>} - Aggregated player statistics
 */
export async function getPlayerTournamentStats(tournamentId, playerId) {
  // Get all matches for the tournament
  const matches = await prisma.match.findMany({
    where: {
      tournamentId,
      status: 'completed',
    },
    select: {
      id: true,
    },
  });

  const matchIds = matches.map(match => match.id);

  // Get player stats for all these matches
  const stats = await prisma.playerStats.findMany({
    where: {
      playerId,
      matchId: {
        in: matchIds,
      },
    },
  });

  // Aggregate the stats
  const aggregatedStats = {
    totalMatches: stats.length,
    totalKills: stats.reduce((sum, stat) => sum + stat.kills, 0),
    totalDeaths: stats.reduce((sum, stat) => sum + stat.deaths, 0),
    totalAssists: stats.reduce((sum, stat) => sum + stat.assists, 0),
    totalDamage: stats.reduce((sum, stat) => sum + stat.damage, 0),
    averageKills: stats.length > 0 ? stats.reduce((sum, stat) => sum + stat.kills, 0) / stats.length : 0,
    averageDeaths: stats.length > 0 ? stats.reduce((sum, stat) => sum + stat.deaths, 0) / stats.length : 0,
    averageAssists: stats.length > 0 ? stats.reduce((sum, stat) => sum + stat.assists, 0) / stats.length : 0,
    averageDamage: stats.length > 0 ? stats.reduce((sum, stat) => sum + stat.damage, 0) / stats.length : 0,
    kdRatio: stats.reduce((sum, stat) => sum + stat.deaths, 0) > 0 
      ? stats.reduce((sum, stat) => sum + stat.kills, 0) / stats.reduce((sum, stat) => sum + stat.deaths, 0)
      : stats.reduce((sum, stat) => sum + stat.kills, 0),
  };

  return aggregatedStats;
}

/**
 * Get top players for a tournament based on specific stat
 * @param {String} tournamentId - Tournament ID
 * @param {String} stat - Stat to sort by (kills, damage, etc.)
 * @param {Number} limit - Number of players to return
 * @returns {Promise<Array>} - Top players
 */
export async function getTopTournamentPlayers(tournamentId, stat = 'kills', limit = 10) {
  // Get all completed matches for the tournament
  const matches = await prisma.match.findMany({
    where: {
      tournamentId,
      status: 'completed',
    },
    select: {
      id: true,
    },
  });

  const matchIds = matches.map(match => match.id);

  // Get all player stats for these matches
  const playerStats = await prisma.playerStats.findMany({
    where: {
      matchId: {
        in: matchIds,
      },
    },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          ingameId: true,
          teamId: true,
          team: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      },
    },
  });

  // Group stats by player
  const statsByPlayer = {};
  
  playerStats.forEach(ps => {
    if (!statsByPlayer[ps.playerId]) {
      statsByPlayer[ps.playerId] = {
        player: ps.player,
        totalMatches: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalAssists: 0,
        totalDamage: 0,
      };
    }
    
    statsByPlayer[ps.playerId].totalMatches += 1;
    statsByPlayer[ps.playerId].totalKills += ps.kills;
    statsByPlayer[ps.playerId].totalDeaths += ps.deaths;
    statsByPlayer[ps.playerId].totalAssists += ps.assists;
    statsByPlayer[ps.playerId].totalDamage += ps.damage;
  });

  // Convert to array and calculate averages
  let players = Object.values(statsByPlayer).map(p => ({
    ...p,
    averageKills: p.totalMatches > 0 ? p.totalKills / p.totalMatches : 0,
    averageDeaths: p.totalMatches > 0 ? p.totalDeaths / p.totalMatches : 0,
    averageAssists: p.totalMatches > 0 ? p.totalAssists / p.totalMatches : 0,
    averageDamage: p.totalMatches > 0 ? p.totalDamage / p.totalMatches : 0,
    kdRatio: p.totalDeaths > 0 ? p.totalKills / p.totalDeaths : p.totalKills,
  }));

  // Sort by the requested stat
  const sortMap = {
    kills: 'totalKills',
    damage: 'totalDamage',
    assists: 'totalAssists',
    kd: 'kdRatio',
    avgKills: 'averageKills',
    avgDamage: 'averageDamage',
  };

  const sortField = sortMap[stat] || 'totalKills';
  
  players.sort((a, b) => b[sortField] - a[sortField]);

  // Return limited number of players
  return players.slice(0, limit);
}
