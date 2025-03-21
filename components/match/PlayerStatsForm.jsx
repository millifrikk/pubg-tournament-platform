import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Schema for player stats validation
const playerStatSchema = z.object({
  playerId: z.string({
    required_error: "Player ID is required",
  }),
  kills: z.string().transform(val => parseInt(val, 10)),
  deaths: z.string().transform(val => parseInt(val, 10)),
  assists: z.string().transform(val => parseInt(val, 10)),
  damage: z.string().transform(val => parseFloat(val)),
});

/**
 * PlayerStatsForm component for entering match player statistics
 * @param {Object} props
 * @param {String} props.matchId - ID of the match
 * @param {Object} props.match - Match details including teams
 * @param {Array} props.existingStats - Existing player statistics (if any)
 * @param {Function} props.onSubmit - Function to call on form submission
 */
const PlayerStatsForm = ({ matchId, match, existingStats = [], onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [players, setPlayers] = useState([]);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  
  // Fetch players for both teams
  useEffect(() => {
    async function fetchPlayers() {
      try {
        // In an actual implementation, you'd fetch players for both teams
        // For this placeholder, we'll just create dummy data
        
        const dummyTeam1Players = [
          { id: 'player1', name: 'Player 1', teamId: match.team1Id },
          { id: 'player2', name: 'Player 2', teamId: match.team1Id },
          { id: 'player3', name: 'Player 3', teamId: match.team1Id },
          { id: 'player4', name: 'Player 4', teamId: match.team1Id },
        ];
        
        const dummyTeam2Players = [
          { id: 'player5', name: 'Player 5', teamId: match.team2Id },
          { id: 'player6', name: 'Player 6', teamId: match.team2Id },
          { id: 'player7', name: 'Player 7', teamId: match.team2Id },
          { id: 'player8', name: 'Player 8', teamId: match.team2Id },
        ];
        
        setTeam1Players(dummyTeam1Players);
        setTeam2Players(dummyTeam2Players);
        setPlayers([...dummyTeam1Players, ...dummyTeam2Players]);
      } catch (err) {
        setError('Failed to fetch players');
        console.error('Error fetching players:', err);
      }
    }
    
    if (match) {
      fetchPlayers();
    }
  }, [match]);

  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError("");
      
      // In an actual implementation, you'd submit the data to the API
      console.log('Would submit player stats:', data);
      
      // Call the onSubmit callback
      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      console.error('Error submitting player stats:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Player Statistics</h2>
      
      {error && (
        <div className="bg-red-700 text-white p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Team 1 Players */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">{match.team1?.name}</h3>
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="grid grid-cols-5 gap-4 mb-2 font-medium">
            <div className="col-span-1">Player</div>
            <div className="col-span-1 text-center">Kills</div>
            <div className="col-span-1 text-center">Deaths</div>
            <div className="col-span-1 text-center">Assists</div>
            <div className="col-span-1 text-center">Damage</div>
          </div>
          
          {team1Players.map(player => (
            <div key={player.id} className="grid grid-cols-5 gap-4 py-2 border-t border-gray-600">
              <div className="col-span-1">{player.name}</div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full bg-gray-600 text-white rounded p-1 text-center"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full bg-gray-600 text-white rounded p-1 text-center"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full bg-gray-600 text-white rounded p-1 text-center"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue="0"
                  className="w-full bg-gray-600 text-white rounded p-1 text-center"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Team 2 Players */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">{match.team2?.name}</h3>
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="grid grid-cols-5 gap-4 mb-2 font-medium">
            <div className="col-span-1">Player</div>
            <div className="col-span-1 text-center">Kills</div>
            <div className="col-span-1 text-center">Deaths</div>
            <div className="col-span-1 text-center">Assists</div>
            <div className="col-span-1 text-center">Damage</div>
          </div>
          
          {team2Players.map(player => (
            <div key={player.id} className="grid grid-cols-5 gap-4 py-2 border-t border-gray-600">
              <div className="col-span-1">{player.name}</div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full bg-gray-600 text-white rounded p-1 text-center"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full bg-gray-600 text-white rounded p-1 text-center"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full bg-gray-600 text-white rounded p-1 text-center"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue="0"
                  className="w-full bg-gray-600 text-white rounded p-1 text-center"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
          onClick={() => handleFormSubmit({ /* form data would go here */ })}
        >
          {isSubmitting ? "Saving..." : "Save Statistics"}
        </button>
      </div>
      
      <p className="text-gray-400 text-sm mt-6 text-center">
        Note: This is a placeholder component. In a real implementation, this form would properly validate and submit player statistics to the API.
      </p>
    </div>
  );
};

export default PlayerStatsForm;
