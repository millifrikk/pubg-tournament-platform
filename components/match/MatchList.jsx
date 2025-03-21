import React from 'react';
import MatchCard from './MatchCard';

/**
 * MatchList component to display a list of matches
 * @param {Object} props
 * @param {Array} props.matches - Array of match data
 * @param {boolean} props.isAdmin - Whether the user is an admin
 * @param {string} props.emptyMessage - Message to display when there are no matches
 */
const MatchList = ({ 
  matches, 
  isAdmin = false, 
  emptyMessage = "No matches found" 
}) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match) => (
        <MatchCard 
          key={match.id} 
          match={match} 
          isAdmin={isAdmin} 
        />
      ))}
    </div>
  );
};

export default MatchList;
