import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';

/**
 * MatchCard component to display a match summary
 * @param {Object} props
 * @param {Object} props.match - Match data
 * @param {boolean} props.isAdmin - Whether the user is an admin
 */
const MatchCard = ({ match, isAdmin = false }) => {
  const isScheduled = match.status === 'scheduled';
  const isCompleted = match.status === 'completed';
  const isInProgress = match.status === 'in_progress';
  const isCancelled = match.status === 'cancelled';

  const getStatusColor = () => {
    if (isScheduled) return 'bg-blue-900 text-blue-100';
    if (isInProgress) return 'bg-green-900 text-green-100';
    if (isCompleted) return 'bg-purple-900 text-purple-100';
    if (isCancelled) return 'bg-red-900 text-red-100';
    return 'bg-gray-700 text-gray-100';
  };
  
  const getStatusText = () => {
    if (isScheduled) return 'Scheduled';
    if (isInProgress) return 'In Progress';
    if (isCompleted) return 'Completed';
    if (isCancelled) return 'Cancelled';
    return 'Unknown';
  };

  const getDateDisplay = () => {
    if (!match.scheduledDate) return 'Date TBD';
    
    const date = new Date(match.scheduledDate);
    
    if (isScheduled) {
      return (
        <>
          <div className="text-sm">{format(date, 'MMM d, yyyy')}</div>
          <div className="text-xs text-gray-400">{format(date, 'h:mm a')}</div>
          <div className="text-xs text-gray-500">{formatDistanceToNow(date, { addSuffix: true })}</div>
        </>
      );
    }
    
    if (isCompleted && match.completedDate) {
      const completedDate = new Date(match.completedDate);
      return (
        <>
          <div className="text-sm">{format(completedDate, 'MMM d, yyyy')}</div>
          <div className="text-xs text-gray-400">{format(completedDate, 'h:mm a')}</div>
        </>
      );
    }
    
    return format(date, 'MMM d, yyyy • h:mm a');
  };

  const getScoreDisplay = () => {
    if (isCompleted) {
      return (
        <div className="flex items-center justify-center space-x-3 font-bold">
          <span className={match.team1Id === match.winnerId ? "text-green-500" : ""}>{match.team1Score}</span>
          <span>-</span>
          <span className={match.team2Id === match.winnerId ? "text-green-500" : ""}>{match.team2Score}</span>
        </div>
      );
    }
    
    if (isInProgress) {
      return (
        <div className="flex items-center justify-center space-x-3 font-bold">
          <span>{match.team1Score}</span>
          <span>-</span>
          <span>{match.team2Score}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center font-bold text-gray-500">vs</div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className={`text-xs px-2 py-1 rounded ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <div className="text-right">
            {getDateDisplay()}
          </div>
        </div>
        
        <div className="mt-4 flex items-center">
          <div className="w-5/12 text-right">
            <Link 
              href={`/teams/${match.team1?.id}`} 
              className="text-white hover:text-purple-300 transition-colors duration-200"
            >
              <div className="font-semibold">{match.team1?.name}</div>
            </Link>
          </div>
          
          <div className="w-2/12 text-center">
            {getScoreDisplay()}
          </div>
          
          <div className="w-5/12 text-left">
            <Link 
              href={`/teams/${match.team2?.id}`} 
              className="text-white hover:text-purple-300 transition-colors duration-200"
            >
              <div className="font-semibold">{match.team2?.name}</div>
            </Link>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-400">
          <Link 
            href={`/tournaments/${match.tournament?.slug}`} 
            className="hover:text-purple-300 transition-colors duration-200"
          >
            {match.tournament?.name}
          </Link>
          <span className="mx-2">•</span>
          <span>Round {match.round}</span>
          <span className="mx-2">•</span>
          <span>Match {match.matchNumber}</span>
        </div>
      </div>
      
      {isAdmin && (
        <div className="bg-gray-900 px-4 py-2 border-t border-gray-700">
          <div className="flex justify-end space-x-2">
            <Link 
              href={`/admin-new/matches/${match.id}`}
              className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded transition-colors duration-200"
            >
              View/Edit
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCard;
