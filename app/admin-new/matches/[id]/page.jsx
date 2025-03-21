'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import MatchForm from '@/components/match/MatchForm';
import PlayerStatsForm from '@/components/match/PlayerStatsForm';

export default function EditMatchPage({ params }) {
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [match, setMatch] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

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
        
        // Fetch match details
        const matchResponse = await fetch(`/api/admin/matches/${id}?includePlayerStats=true`);
        const matchResult = await matchResponse.json();
        
        if (!matchResult.success) {
          throw new Error(matchResult.error.message || 'Failed to fetch match details');
        }
        
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
        
        setMatch(matchResult.data);
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
  }, [session, id]);

  // Handle form submission
  const handleSubmit = async (data) => {
    try {
      const response = await fetch(`/api/admin/matches/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error.message || 'Failed to update match');
      }
      
      // Update local match data
      setMatch(result.data);
      
      return result.data;
    } catch (err) {
      throw new Error(err.message || 'An error occurred while updating the match');
    }
  };

  // Handle match deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        const response = await fetch(`/api/admin/matches/${id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error.message || 'Failed to delete match');
        }
        
        // Redirect to match list on success
        router.push('/admin-new/matches');
      } catch (err) {
        setError(err.message || 'An error occurred while deleting the match');
      }
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Match</h1>
          
          <div className="flex space-x-2">
            <Link
              href="/admin-new/matches"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Back to List
            </Link>
            
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded transition-colors"
            >
              Delete Match
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-700 text-white p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">Loading match data...</div>
          </div>
        ) : match ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Match Details
              </button>
              
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'stats'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('stats')}
                disabled={match.status === 'scheduled'}
              >
                Player Statistics
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'details' ? (
                <MatchForm 
                  match={match} 
                  tournaments={tournaments} 
                  teams={teams} 
                  onSubmit={handleSubmit} 
                />
              ) : (
                <div className="text-center py-12">
                  {/* This would be implemented in PlayerStatsForm.jsx */}
                  <p className="text-gray-400">Player statistics form would be displayed here.</p>
                  <p className="text-sm text-gray-500 mt-2">This is a placeholder for the PlayerStatsForm component.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <p className="text-gray-400">Match not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
