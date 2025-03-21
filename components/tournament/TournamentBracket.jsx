// components/tournament/TournamentBracket.jsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bracket, Seed, SeedItem, SeedTeam } from 'react-brackets';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Custom theme for the bracket
const customTheme = {
  fontFamily: '"Inter", sans-serif',
  transitionTimingFunction: 'ease-in-out',
  transitionDuration: '300ms',
  boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 8px',
  textColor: 'white',
  borderRadius: '8px',
  lineInfo: {
    color: 'rgba(107, 114, 128, 0.5)',
    highlightColor: 'rgba(139, 92, 246, 0.5)',
    thickness: '2px',
  },
  roundHeader: {
    backgroundColor: 'transparent',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    paddingVertical: '10px',
  },
  roundSeparatorWidth: '32px',
  seed: {
    boxShadow: 'none',
    borderRadius: '8px',
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    border: '1px solid rgba(75, 85, 99, 0.3)',
    paddingX: '12px',
    paddingY: '8px',
    width: '220px',
    minWidth: '220px',
    marginVertical: '8px',
    transition: 'border-color 300ms ease, background-color 300ms ease',
    '&:hover': {
      borderColor: 'rgba(139, 92, 246, 0.5)',
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
    },
  },
  seedItem: {
    transition: 'all 300ms ease',
  },
  seedTeam: {
    paddingVertical: '8px',
    paddingHorizontal: '8px',
    fontSize: '13px',
    gap: '8px',
    color: 'white',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    transition: 'border-color 300ms ease',
    borderRadius: '4px',
  },
  seedTeamHover: {
    backgroundColor: 'rgba(75, 85, 99, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  seedTeamActive: {
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
  },
  seedNumber: {
    fontSize: '12px',
    color: 'rgba(156, 163, 175, 1)',
  },
};

// Custom components for the bracket
const CustomSeedTeam = ({ team, score, teamId, ...props }) => {
  return (
    <SeedTeam {...props} className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {team?.logo && (
          <div className="w-6 h-6 relative">
            <Image 
              src={team.logo || '/images/team-placeholder.png'} 
              alt={team.name || 'TBD'} 
              width={24} 
              height={24}
              className="rounded-sm object-contain"
            />
          </div>
        )}
        <span className="truncate max-w-32">
          {team?.name || 'TBD'}
        </span>
      </div>
      <span className="font-mono font-semibold">{score}</span>
    </SeedTeam>
  );
};

export function TournamentBracket({ tournament }) {
  const [bracketType, setBracketType] = useState('elimination');
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [bracketData, setBracketData] = useState([]);
  
  useEffect(() => {
    if (tournament) {
      // Process tournament data to build bracket
      // This would normally come from the API with the correct structure
      
      // For demonstration purposes, we'll create a mock bracket
      const mockBracket = generateMockBracket(tournament);
      setBracketData(mockBracket);
      setTotalRounds(mockBracket.length);
    }
  }, [tournament, bracketType]);
  
  // Function to generate mock bracket data based on tournament format
  const generateMockBracket = (tournament) => {
    // In a real app, you would fetch this from the API
    // based on the tournament's actual bracket structure
    
    const seeds = tournament.teams?.map(team => ({
      id: team.id,
      name: team.name,
      logo: team.logo,
    })) || [];
    
    // Fill in any empty spots to make it power of 2
    let teamCount = seeds.length;
    const roundsNeeded = Math.ceil(Math.log2(teamCount));
    const totalTeams = Math.pow(2, roundsNeeded);
    
    for (let i = teamCount; i < totalTeams; i++) {
      seeds.push({ id: `empty-${i}`, name: 'TBD' });
    }
    
    // Build single elimination bracket
    if (bracketType === 'elimination') {
      return buildSingleEliminationBracket(seeds);
    } 
    // Build double elimination bracket
    else if (bracketType === 'double-elimination') {
      return buildDoubleEliminationBracket(seeds);
    }
    // Build group stages
    else if (bracketType === 'groups') {
      return buildGroupStagesBracket(seeds);
    }
    
    // Default to single elimination
    return buildSingleEliminationBracket(seeds);
  };
  
  // Helper function to build single elimination bracket
  const buildSingleEliminationBracket = (teams) => {
    const rounds = [];
    let remainingTeams = [...teams];
    let roundNumber = 1;
    
    while (remainingTeams.length > 1) {
      const seeds = [];
      const matchCount = remainingTeams.length / 2;
      
      for (let i = 0; i < matchCount; i++) {
        const team1 = remainingTeams[i * 2];
        const team2 = remainingTeams[i * 2 + 1];
        
        // For completed rounds, randomly pick a winner for demo purposes
        let team1Score = null;
        let team2Score = null;
        let winner = null;
        
        if (roundNumber < 3) { // Make first 2 rounds have results
          team1Score = Math.floor(Math.random() * 16);
          team2Score = Math.floor(Math.random() * 16);
          
          // Ensure scores are different
          if (team1Score === team2Score) {
            team2Score = team1Score > 0 ? team1Score - 1 : team1Score + 1;
          }
          
          winner = team1Score > team2Score ? team1 : team2;
        }
        
        seeds.push({
          id: `round-${roundNumber}-match-${i}`,
          teams: [
            { 
              id: team1.id,
              name: team1.name, 
              logo: team1.logo,
              score: team1Score
            },
            { 
              id: team2.id, 
              name: team2.name, 
              logo: team2.logo,
              score: team2Score
            }
          ],
          winner: winner
        });
      }
      
      rounds.push({
        title: roundNumber === 1 ? 'Round 1' : 
               roundNumber === Math.log2(teams.length) ? 'Final' : 
               `Round ${roundNumber}`,
        seeds
      });
      
      // For next round, collect winners
      const winners = seeds.map(seed => seed.winner).filter(Boolean);
      
      // If no winners yet (future rounds), create placeholder teams
      if (winners.length < matchCount / 2) {
        remainingTeams = [];
        for (let i = 0; i < matchCount / 2; i++) {
          remainingTeams.push({ id: `tbd-${roundNumber}-${i}`, name: 'TBD' });
        }
      } else {
        remainingTeams = winners;
      }
      
      roundNumber++;
    }
    
    return rounds;
  };
  
  // Helper function to build double elimination bracket
  const buildDoubleEliminationBracket = (teams) => {
    // For simplicity in this demo, we'll just create a structure
    // that looks like a double elimination bracket
    
    // First create the winners bracket
    const winnersBracket = buildSingleEliminationBracket(teams);
    
    // Create a simplified losers bracket
    const losersBracket = [];
    for (let i = 0; i < winnersBracket.length - 1; i++) {
      losersBracket.push({
        title: `Losers Round ${i + 1}`,
        seeds: winnersBracket[i].seeds.map((seed, index) => ({
          id: `losers-${i}-${index}`,
          teams: [
            { id: `loser-${i}-${index}-1`, name: 'Loser of W' + (i + 1), score: null },
            { id: `loser-${i}-${index}-2`, name: 'Loser of W' + (i + 2), score: null }
          ]
        }))
      });
    }
    
    // Final match (Grand Final)
    const grandFinal = {
      title: 'Grand Final',
      seeds: [{
        id: 'grand-final',
        teams: [
          { id: 'winner-w', name: 'Winner of Winners Bracket', score: null },
          { id: 'winner-l', name: 'Winner of Losers Bracket', score: null }
        ]
      }]
    };
    
    // Combine all brackets for display
    return [...winnersBracket, ...losersBracket, grandFinal];
  };
  
  // Helper function to build group stages bracket
  const buildGroupStagesBracket = (teams) => {
    // For this demo, we'll create 4 groups with teams distributed evenly
    const groupCount = 4;
    const teamsPerGroup = Math.ceil(teams.length / groupCount);
    const groups = [];
    
    for (let i = 0; i < groupCount; i++) {
      const groupTeams = teams.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup);
      if (groupTeams.length === 0) continue;
      
      // Create round-robin matches within each group
      const seeds = [];
      for (let j = 0; j < groupTeams.length; j++) {
        for (let k = j + 1; k < groupTeams.length; k++) {
          // For demo purposes, generate random scores for some matches
          const scoreA = Math.random() > 0.3 ? Math.floor(Math.random() * 16) : null;
          const scoreB = scoreA !== null ? Math.floor(Math.random() * 16) : null;
          
          // Ensure scores are different if both exist
          const adjustedScoreB = (scoreA !== null && scoreB !== null && scoreA === scoreB) 
            ? (scoreB > 0 ? scoreB - 1 : scoreB + 1) 
            : scoreB;
          
          seeds.push({
            id: `group-${i}-match-${j}-${k}`,
            teams: [
              { 
                id: groupTeams[j].id, 
                name: groupTeams[j].name, 
                logo: groupTeams[j].logo, 
                score: scoreA 
              },
              { 
                id: groupTeams[k].id, 
                name: groupTeams[k].name, 
                logo: groupTeams[k].logo, 
                score: adjustedScoreB 
              }
            ]
          });
        }
      }
      
      groups.push({
        title: `Group ${String.fromCharCode(65 + i)}`, // Group A, B, C, D
        seeds
      });
    }
    
    return groups;
  };
  
  // Handle navigation between rounds for mobile view
  const handlePrevRound = () => {
    setCurrentRound(prev => Math.max(0, prev - 1));
  };
  
  const handleNextRound = () => {
    setCurrentRound(prev => Math.min(totalRounds - 1, prev + 1));
  };
  
  // Render custom components for the bracket
  const renderSeed = ({ seed, breakpoint, roundIndex, seedIndex }) => {
    return (
      <Seed mobileBreakpoint={breakpoint} style={{ width: '100%' }}>
        <SeedItem>
          <CustomSeedTeam 
            team={seed.teams[0]}
            score={seed.teams[0]?.score}
            teamId={seed.teams[0]?.id}
          />
        </SeedItem>
        <SeedItem>
          <CustomSeedTeam 
            team={seed.teams[1]}
            score={seed.teams[1]?.score}
            teamId={seed.teams[1]?.id}
          />
        </SeedItem>
      </Seed>
    );
  };
  
  // On mobile, only show one round at a time
  const mobileRounds = bracketData.length > 0 
    ? [bracketData[currentRound]] 
    : [];
  
  return (
    <div className="space-y-6">
      {/* Bracket Type Selector */}
      <Tabs
        value={bracketType}
        onValueChange={setBracketType}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="elimination">Single Elimination</TabsTrigger>
          <TabsTrigger value="double-elimination">Double Elimination</TabsTrigger>
          <TabsTrigger value="groups">Group Stages</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Mobile Round Navigation */}
      <div className="flex items-center justify-between md:hidden">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePrevRound}
          disabled={currentRound === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        
        <span className="text-sm font-medium">
          {bracketData[currentRound]?.title || 'Round'}
        </span>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleNextRound}
          disabled={currentRound === totalRounds - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      {/* Bracket Visualization */}
      <div className="overflow-x-auto">
        <div className="min-w-max p-4">
          {/* Desktop View - Show full bracket */}
          <div className="hidden md:block">
            <Bracket
              rounds={bracketData}
              renderSeedComponent={renderSeed}
              theme={customTheme}
              roundTitleComponent={(title) => (
                <div className="text-center mb-4 text-white font-semibold">{title}</div>
              )}
              mobileBreakpoint={768} // This won't be used as we're handling mobile separately
            />
          </div>
          
          {/* Mobile View - Show one round at a time */}
          <div className="md:hidden">
            <Bracket
              rounds={mobileRounds}
              renderSeedComponent={renderSeed}
              theme={customTheme}
              roundTitleComponent={(title) => (
                <div className="text-center mb-4 text-white font-semibold">{title}</div>
              )}
            />
          </div>
        </div>
      </div>
      
      {/* Bracket Legend */}
      <div className="bg-gray-800/30 p-4 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-sm mr-2"></div>
            <span>Winner</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-sm mr-2"></div>
            <span>Loser</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 border border-gray-500 rounded-sm mr-2"></div>
            <span>Upcoming Match</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
            <span>Live Match</span>
          </div>
        </div>
      </div>
    </div>
  );
}