// components/match/MatchCard.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { MoreHorizontal, Clock, Play, Eye } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const statusConfig = {
  SCHEDULED: {
    label: 'Scheduled',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: Clock,
  },
  LIVE: {
    label: 'Live',
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: Play,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: null,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    icon: null,
  },
};

export function MatchCard({ match, compact = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { team1, team2, tournament, dateTime, status, scoreTeam1, scoreTeam2, matchDetails, vodLink } = match;
  const StatusIcon = statusConfig[status]?.icon;
  
  const formattedDate = format(new Date(dateTime), 'MMM d, yyyy');
  const formattedTime = format(new Date(dateTime), 'h:mm a');
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:border-purple-500/50",
      compact ? "border" : "border-2",
      isExpanded ? "shadow-lg" : ""
    )}>
      <CardContent className={cn(
        "p-0",
        !compact && "divide-y divide-gray-800"
      )}>
        {/* Match Header - Tournament Info */}
        {!compact && (
          <div className="px-4 py-3 bg-gray-800/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {tournament?.logo && (
                <Image
                  src={tournament.logo}
                  alt={tournament.name}
                  width={24}
                  height={24}
                  className="rounded-sm"
                />
              )}
              <Link 
                href={`/tournaments/${tournament.slug}`}
                className="text-sm font-medium hover:text-purple-400 transition-colors"
              >
                {tournament.name}
              </Link>
            </div>
            
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium",
                statusConfig[status]?.color
              )}
            >
              {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
              {statusConfig[status]?.label}
            </Badge>
          </div>
        )}
        
        {/* Teams and Score */}
        <div className={cn(
          "px-4 py-3 grid grid-cols-11 gap-2 items-center",
          compact ? "py-2" : ""
        )}>
          {/* Team 1 */}
          <div className="col-span-4 flex items-center space-x-3 justify-end">
            <div className="text-right">
              <Link 
                href={`/teams/${team1.slug}`}
                className={cn(
                  "font-bold hover:text-purple-400 transition-colors block",
                  compact ? "text-sm" : "text-lg"
                )}
              >
                {team1.name}
              </Link>
              {!compact && (
                <span className="text-xs text-gray-400">
                  {team1.country}
                </span>
              )}
            </div>
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src={team1.logo || '/images/team-placeholder.png'}
                alt={team1.name}
                fill
                className="object-contain"
              />
            </div>
          </div>
          
          {/* Score */}
          <div className="col-span-3 text-center">
            {status === 'SCHEDULED' ? (
              <div>
                <div className="text-xs text-gray-400">{formattedDate}</div>
                <div className={cn(
                  "font-mono font-bold",
                  compact ? "text-sm" : "text-lg"
                )}>
                  {formattedTime}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className={cn(
                  "font-mono font-bold",
                  compact ? "text-xl" : "text-3xl",
                  status === 'LIVE' ? "text-red-500" : ""
                )}>
                  {scoreTeam1 ?? 0}
                </div>
                <div className={cn(
                  "mx-2 text-gray-500",
                  compact ? "text-lg" : "text-2xl"
                )}>:</div>
                <div className={cn(
                  "font-mono font-bold",
                  compact ? "text-xl" : "text-3xl",
                  status === 'LIVE' ? "text-red-500" : ""
                )}>
                  {scoreTeam2 ?? 0}
                </div>
              </div>
            )}
          </div>
          
          {/* Team 2 */}
          <div className="col-span-4 flex items-center space-x-3">
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src={team2.logo || '/images/team-placeholder.png'}
                alt={team2.name}
                fill
                className="object-contain"
              />
            </div>
            <div>
              <Link 
                href={`/teams/${team2.slug}`}
                className={cn(
                  "font-bold hover:text-purple-400 transition-colors block",
                  compact ? "text-sm" : "text-lg"
                )}
              >
                {team2.name}
              </Link>
              {!compact && (
                <span className="text-xs text-gray-400">
                  {team2.country}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Match Actions */}
        {!compact && (
          <div className="px-4 py-3 bg-gray-800/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {status === 'SCHEDULED' && (
                <Button variant="ghost" size="sm" className="text-xs">
                  Set Reminder
                </Button>
              )}
              
              {status === 'LIVE' && (
                <Button size="sm" className="text-xs bg-red-600 hover:bg-red-700">
                  <Play className="w-3 h-3 mr-1" />
                  Watch Live
                </Button>
              )}
              
              {status === 'COMPLETED' && vodLink && (
                <Button variant="ghost" size="sm" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Watch VOD
                </Button>
              )}
            </div>
            
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href={`/matches/${match.id}`} className="w-full">
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Share</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
        
        {/* Expanded Match Details */}
        {!compact && isExpanded && matchDetails && (
          <div className="px-4 py-3 bg-gray-900">
            <h4 className="text-sm font-semibold mb-2">Match Details</h4>
            
            {/* Maps Played */}
            {matchDetails.maps && matchDetails.maps.length > 0 && (
              <div className="space-y-2 mb-4">
                {matchDetails.maps.map((map, index) => (
                  <div key={index} className="bg-gray-800 rounded-md p-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">
                        Map {index + 1}: {map.name}
                      </div>
                      <div className="text-sm font-mono">
                        {map.scoreTeam1} : {map.scoreTeam2}
                      </div>
                    </div>
                    
                    {map.highlights && (
                      <div className="mt-1 text-xs text-gray-400">
                        {map.highlights}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Player Stats */}
            {matchDetails.playerStats && (
              <div className="space-y-1">
                <div className="text-sm font-semibold">Top Performers</div>
                <div className="grid grid-cols-2 gap-2">
                  {matchDetails.playerStats.slice(0, 4).map((player, index) => (
                    <div key={index} className="bg-gray-800/50 rounded p-1 flex items-center space-x-2">
                      <div className="w-6 h-6 relative">
                        <Image 
                          src={player.avatar || '/images/player-placeholder.png'} 
                          alt={player.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="text-xs">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-gray-400">{player.stat}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs w-full mt-2"
                >
                  View All Stats
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}