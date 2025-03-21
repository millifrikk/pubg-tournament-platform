import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.name);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log('Created regular user:', user.name);

  // Create teams
  const team1 = await prisma.team.upsert({
    where: { slug: 'team-liquid' },
    update: {},
    create: {
      name: 'Team Liquid',
      slug: 'team-liquid',
      description: 'Professional esports organization with a PUBG division.',
    },
  });
  console.log('Created team:', team1.name);

  const team2 = await prisma.team.upsert({
    where: { slug: 'faze-clan' },
    update: {},
    create: {
      name: 'FaZe Clan',
      slug: 'faze-clan',
      description: 'World-renowned esports organization competing in PUBG tournaments.',
    },
  });
  console.log('Created team:', team2.name);

  // Create players
  const player1 = await prisma.player.create({
    data: {
      name: 'John Doe',
      ingameId: 'JDoe123',
      teamId: team1.id,
    },
  });
  console.log('Created player:', player1.name);

  const player2 = await prisma.player.create({
    data: {
      name: 'Jane Smith',
      ingameId: 'JSmith456',
      teamId: team1.id,
    },
  });
  console.log('Created player:', player2.name);

  const player3 = await prisma.player.create({
    data: {
      name: 'Alex Johnson',
      ingameId: 'AJohnson789',
      teamId: team2.id,
    },
  });
  console.log('Created player:', player3.name);

  const player4 = await prisma.player.create({
    data: {
      name: 'Sam Wilson',
      ingameId: 'SWilson321',
      teamId: team2.id,
    },
  });
  console.log('Created player:', player4.name);

  // Create a tournament
  const tournament = await prisma.tournament.create({
    data: {
      name: 'PUBG Champions League 2025',
      slug: 'pubg-champions-league-2025',
      description: 'The premier PUBG esports tournament of 2025.',
      startDate: new Date('2025-04-15'),
      endDate: new Date('2025-05-30'),
      status: 'UPCOMING',
      prizePool: '$200,000',
      teams: {
        create: [
          { teamId: team1.id },
          { teamId: team2.id },
        ],
      },
    },
  });
  console.log('Created tournament:', tournament.name);

  // Create some matches
  const match1 = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      round: 1,
      matchNumber: 1,
      team1Id: team1.id,
      team2Id: team2.id,
      status: 'SCHEDULED',
      scheduledDate: new Date('2025-04-20T18:00:00Z'),
    },
  });
  console.log('Created match:', `Round ${match1.round}, Match ${match1.matchNumber}`);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });