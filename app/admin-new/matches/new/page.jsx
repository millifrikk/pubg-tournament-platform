'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import MatchForm from '@/components/match/MatchForm';

export default function CreateMatchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [existingMatches, setExistingMatches] = useState([]);

  // Check if user is authenticated and admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session && session.user && session.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // Fetch required data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch tournaments
        const tournamentResponse = await fetch('/api/admin/tournaments');
        const tournamentResult = await tournamentResponse.json();
        
        if (!tournamentResult.success) {
          throw new Error(tournamentResult.error?.message || 'Failed to fetch tournaments');
        }
        
        // Fetch teams
        const teamResponse = await fetch('/api/admin/teams');
        const teamResult = await teamResponse.json();
        
        if (!teamResult.success) {
          throw new Error(teamResult.error?.message || 'Failed to fetch teams');
        }
        
        // Fetch existing matches to show for reference
        const matchesResponse = await fetch('/api/admin/matches');
        const matchesResult = await matchesResponse.json();
        
        if (matchesResult.success && matchesResult.data?.data) {
          setExistingMatches(matchesResult.data.data);
        }
        
        setTournaments(tournamentResult.data);
        setTeams(teamResult.data);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchData();
    }
  }, [session]);

  // Handle form submission
  const handleSubmit = async (data) => {
    try {
      console.log('Submitting to API:', data);
      
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error details:', result.error);
        // Just return the error message instead of throwing
        return result.error?.message || 'Failed to create match';
      }
      
      // Redirect to match list on success
      router.push('/admin-new/matches');
      return null; // No error
    } catch (err) {
      console.error('Match creation error:', err);
      return err.message || 'An error occurred while creating the match';
    }
  };

  if (status === 'loading' || (session?.user?.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="text-center py-12">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Match</h1>
        
        {error && (
          <div className="bg-red-700 text-white p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">Loading form data...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Show existing matches for reference */}
            {existingMatches.length > 0 && (
              <div className="bg-gray-700 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">Existing Matches (For Reference)</h3>
                <p className="text-sm text-gray-300 mb-4">Note: You cannot create a match with the same tournament, round, and match number as an existing match.</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-600">
                      <th className="py-2">Tournament</th>
                      <th className="py-2">Round</th>
                      <th className="py-2">Match #</th>
                      <th className="py-2">Teams</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingMatches.map(match => (
                      <tr key={match.id} className="border-b border-gray-700">
                        <td className="py-2">{match.tournament?.name}</td>
                        <td className="py-2">{match.round}</td>
                        <td className="py-2">{match.matchNumber}</td>
                        <td className="py-2">{match.team1?.name} vs. {match.team2?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-gray-800 p-6 rounded-lg">
              <MatchForm 
                tournaments={tournaments} 
                teams={teams} 
                onSubmit={handleSubmit} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
