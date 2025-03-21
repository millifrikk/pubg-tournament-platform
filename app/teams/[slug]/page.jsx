// app/teams/[slug]/page.jsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { MapPin, Calendar, Trophy, Users, Twitter, Instagram, Twitch, Globe, Youtube } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayerCard } from '@/components/team/PlayerCard';
import { TeamStats } from '@/components/team/TeamStats';
import { TeamAchievements } from '@/components/team/TeamAchievements';
import { MatchList } from '@/components/match/MatchList';
import { FollowButton } from '@/components/ui/FollowButton';
import { getTeamBySlug } from '@/lib/data/teams';

export async function generateMetadata({ params }) {
  const team = await getTeamBySlug(params.slug);
  
  if (!team) {
    return {
      title: 'Team Not Found',
    };
  }
  
  return {
    title: `${team.name} | PUBG Tournament Platform`,
    description: `Official team profile for ${team.name}. View roster, matches, achievements, and stats.`,
    openGraph: {
      images: [team.logo],
    },
  };
}

const socialIcons = {
  twitter: Twitter,
  instagram: Instagram,
  twitch: Twitch,
  youtube: Youtube,
  website: Globe,
};

export default async function TeamProfilePage({ params }) {
  const team = await getTeamBySlug(params.slug);
  
  if (!team) {
    notFound();
  }
  
  return (
    <main className="min-h-screen bg-gray-900 pb-12">
      {/* Team Banner */}
      <div className="relative h-64 md:h-80">
        <div className="absolute inset-0">
          <Image 
            src={team.bannerImage || '/images/default-team-banner.jpg'}
            alt={team.name}
            fill
            className="object-cover brightness-50"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>
      
      {/* Team Info Section */}
      <div className="container mx-auto px-4">
        <div className="relative flex flex-col md:flex-row -mt-16 md:-mt-24 mb-8">
          {/* Team Logo */}
          <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-gray-900 relative z-10 mx-auto md:mx-0">
            <Image 
              src={team.logo || '/images/team-placeholder.png'}
              alt={team.name}
              fill
              className="object-cover"
            />
          </div>
          
          {/* Team Details */}
          <div className="flex-1 md:ml-6 mt-4 md:mt-16 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{team.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-gray-300">
                  {team.country && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {team.country}
                    </div>
                  )}
                  {team.foundedDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Founded {format(new Date(team.foundedDate), 'yyyy')}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {team.players?.length || 0} Players
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1" />
                    {team.achievements?.length || 0} Achievements
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-center gap-3">
                {/* Social Links */}
                {team.socialLinks && (
                  <div className="flex items-center space-x-2">
                    {Object.entries(team.socialLinks).map(([platform, url]) => {
                      const SocialIcon = socialIcons[platform] || Globe;
                      return (
                        <Link 
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors"
                        >
                          <SocialIcon className="h-5 w-5" />
                        </Link>
                      );
                    })}
                  </div>
                )}
                
                {/* Follow Button */}
                <FollowButton 
                  type="team"
                  id={team.id}
                  initialFollowing={false}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Team Description */}
        {team.description && (
          <div className="mb-8">
            <Card>
              <CardContent className="prose prose-invert max-w-none pt-6">
                <p>{team.description}</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Tabs Content */}
        <Tabs defaultValue="roster" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
          
          {/* Roster Tab */}
          <TabsContent value="roster" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Current Roster</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {team.players?.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
              
              {(!team.players || team.players.length === 0) && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-medium">No players listed</h3>
                  <p className="mt-2">This team hasn't added any players to their roster yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Recent Matches</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Upcoming</Button>
                <Button variant="outline" size="sm">Previous</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {team.matches?.length > 0 ? (
                team.matches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 bg-gray-800/30 rounded-lg">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-medium">No matches found</h3>
                  <p className="mt-2">This team hasn't participated in any matches yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Team Achievements</h2>
            
            <TeamAchievements 
              achievements={team.achievements || []}
              teamId={team.id}
            />
          </TabsContent>
          
          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Team Statistics</h2>
            
            <TeamStats 
              teamId={team.id} 
              recentMatches={team.matches?.slice(0, 10) || []}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}