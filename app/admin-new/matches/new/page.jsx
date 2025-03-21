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
          throw new Error(tournamentResult.error.message || 'Failed to fetch tournaments');
        }
        
        // Fetch teams
        const teamResponse = await fetch('/api/admin/teams');
        const teamResult = await teamResponse.json();
        
        if (!teamResult.success) {
          throw new Error(teamResult.error.message || 'Failed to fetch teams');
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
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error.message || 'Failed to create match');
      }
      
      // Redirect to match list on success
      router.push('/admin-new/matches');
    } catch (err) {
      throw new Error(err.message || 'An error occurred while creating the match');
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
          <div className="bg-gray-800 p-6 rounded-lg">
            <MatchForm 
              tournaments={tournaments} 
              teams={teams} 
              onSubmit={handleSubmit} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
