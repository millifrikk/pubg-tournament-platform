// app/tournaments/[slug]/page.jsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { TournamentBracket } from '@/components/tournament/TournamentBracket';
import { MatchList } from '@/components/match/MatchList';
import { TeamGrid } from '@/components/team/TeamGrid';
import { TournamentStats } from '@/components/tournament/TournamentStats';
import { FollowButton } from '@/components/ui/FollowButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTournamentBySlug } from '@/lib/data/tournaments';

export async function generateMetadata({ params }) {
  const tournament = await getTournamentBySlug(params.slug);
  
  if (!tournament) {
    return {
      title: 'Tournament Not Found',
    };
  }
  
  return {
    title: `${tournament.name} | PUBG Tournament Platform`,
    description: tournament.description,
    openGraph: {
      images: [tournament.bannerImage],
    },
  };
}

export default async function TournamentDetailPage({ params }) {
  const tournament = await getTournamentBySlug(params.slug);
  
  if (!tournament) {
    notFound();
  }
  
  const statusColor = {
    UPCOMING: 'bg-blue-500',
    ONGOING: 'bg-green-500',
    COMPLETED: 'bg-gray-500',
    CANCELLED: 'bg-red-500',
  };
  
  return (
    <main className="min-h-screen bg-gray-900 pb-12">
      {/* Banner with Tournament Info */}
      <div className="relative h-80">
        <div className="absolute inset-0">
          <Image 
            src={tournament.bannerImage || '/images/default-tournament-banner.jpg'}
            alt={tournament.name}
            fill
            className="object-cover brightness-50"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge className={`${statusColor[tournament.status]} mb-3`}>
                {tournament.status}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{tournament.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {format(new Date(tournament.startDate), 'MMM dd')} - {format(new Date(tournament.endDate), 'MMM dd, yyyy')}
                </div>
                {tournament.prizePool && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Prize Pool: {tournament.prizePool}
                  </div>
                )}
              </div>
            </div>
            <FollowButton 
              type="tournament"
              id={tournament.id}
              initialFollowing={false}
              className="md:self-start"
            />
          </div>
        </div>
      </div>
      
      {/* Tournament Content */}
      <div className="container mx-auto px-4 mt-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bracket">Bracket</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-lg prose-invert max-w-none">
                  <p>{tournament.description}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Latest Matches</h2>
                <MatchList 
                  matches={tournament.matches.slice(0, 5)}
                  compact={true}
                />
                <Link 
                  href={`/tournaments/${params.slug}/matches`} 
                  className="mt-4 inline-block text-purple-400 hover:text-purple-300"
                >
                  View all matches →
                </Link>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Participating Teams</h2>
                <TeamGrid 
                  teams={tournament.teams.slice(0, 6)}
                  compact={true}
                />
                <Link 
                  href={`/tournaments/${params.slug}/teams`} 
                  className="mt-4 inline-block text-purple-400 hover:text-purple-300"
                >
                  View all teams →
                </Link>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bracket">
            <Card>
              <CardContent className="pt-6">
                <TournamentBracket tournament={tournament} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="matches">
            <Card>
              <CardContent className="pt-6">
                <MatchList matches={tournament.matches} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="teams">
            <Card>
              <CardContent className="pt-6">
                <TeamGrid teams={tournament.teams} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats">
            <Card>
              <CardContent className="pt-6">
                <TournamentStats tournament={tournament} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rules">
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-lg prose-invert max-w-none">
                  {tournament.rules ? (
                    <div dangerouslySetInnerHTML={{ __html: tournament.rules }} />
                  ) : (
                    <p>No rules have been provided for this tournament.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}