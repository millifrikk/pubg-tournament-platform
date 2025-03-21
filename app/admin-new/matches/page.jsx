'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import MatchList from '@/components/match/MatchList';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminMatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedTournament, setSelectedTournament] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check if user is authenticated and admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session && session.user && session.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // Fetch tournaments for filter
  useEffect(() => {
    async function fetchTournaments() {
      try {
        const response = await fetch('/api/admin/tournaments');
        const result = await response.json();
        
        if (result.success) {
          setTournaments(result.data);
        } else {
          console.error('Error fetching tournaments:', result.error);
        }
      } catch (err) {
        console.error('Failed to fetch tournaments:', err);
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchTournaments();
    }
  }, [session]);

  // Fetch matches with filters
  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        
        const queryParams = new URLSearchParams({
          page: currentPage,
          limit: 12, // Number of matches per page
        });
        
        if (selectedTournament) {
          queryParams.append('tournamentId', selectedTournament);
        }
        
        if (selectedStatus) {
          queryParams.append('status', selectedStatus);
        }
        
        const response = await fetch(`/api/admin/matches?${queryParams.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          setMatches(result.data.data);
          setTotalPages(result.data.pagination.totalPages);
        } else {
          setError(result.error.message || 'Failed to fetch matches');
          console.error('Error fetching matches:', result.error);
        }
      } catch (err) {
        setError('An error occurred while fetching matches');
        console.error('Failed to fetch matches:', err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchMatches();
    }
  }, [session, currentPage, selectedTournament, selectedStatus]);

  // Handle filter changes
  const handleTournamentChange = (e) => {
    setSelectedTournament(e.target.value);
    setCurrentPage(1);
  };
  
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Match Management</h1>
          <Link 
            href="/admin-new/matches/new" 
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded transition-colors"
          >
            Create New Match
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tournament
              </label>
              <select
                value={selectedTournament}
                onChange={handleTournamentChange}
                className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
              >
                <option value="">All Tournaments</option>
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-700 text-white p-4 rounded mb-6">
            {error}
          </div>
        )}

        {/* Matches List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">Loading matches...</div>
          </div>
        ) : (
          <>
            <MatchList 
              matches={matches} 
              isAdmin={true} 
              emptyMessage="No matches found. Adjust your filters or create a new match."
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
