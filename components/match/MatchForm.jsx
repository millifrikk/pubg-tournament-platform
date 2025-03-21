import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Schema for match form validation
const matchFormSchema = z.object({
  tournamentId: z.string({
    required_error: "Tournament is required",
  }),
  round: z.string().transform(val => parseInt(val, 10)),
  matchNumber: z.string().transform(val => parseInt(val, 10)),
  team1Id: z.string({
    required_error: "Team 1 is required",
  }),
  team2Id: z.string({
    required_error: "Team 2 is required",
  }),
  scheduledDate: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
}).refine(data => data.team1Id !== data.team2Id, {
  message: "Team 1 and Team 2 cannot be the same team",
  path: ["team2Id"],
});

/**
 * MatchForm component for creating or editing matches
 * @param {Object} props
 * @param {Object} props.match - Match data (for editing)
 * @param {Array} props.tournaments - Available tournaments
 * @param {Array} props.teams - Available teams
 * @param {Function} props.onSubmit - Function to call on form submission
 */
const MatchForm = ({ match, tournaments = [], teams = [], onSubmit }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [filteredTeams, setFilteredTeams] = useState([]);
  
  const isEditMode = !!match;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(matchFormSchema),
    defaultValues: isEditMode
      ? {
          tournamentId: match.tournamentId,
          round: match.round.toString(),
          matchNumber: match.matchNumber.toString(),
          team1Id: match.team1Id,
          team2Id: match.team2Id,
          scheduledDate: match.scheduledDate 
            ? new Date(match.scheduledDate).toISOString().slice(0, 16) 
            : "",
          status: match.status,
        }
      : {
          tournamentId: "",
          round: "1",
          matchNumber: "1",
          team1Id: "",
          team2Id: "",
          scheduledDate: "",
          status: "scheduled",
        }
  });

  const watchTournamentId = watch("tournamentId");
  
  // Filter teams by selected tournament
  useEffect(() => {
    if (watchTournamentId) {
      // Here you'd typically fetch teams for the selected tournament
      // For now, we'll just use all teams
      setFilteredTeams(teams);
    } else {
      setFilteredTeams([]);
    }
  }, [watchTournamentId, teams]);

  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError("");
      
      // Format the date properly if provided
      if (data.scheduledDate) {
        // Make sure it's in ISO format
        const date = new Date(data.scheduledDate);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date format");
        }
        data.scheduledDate = date.toISOString();
      }
      
      console.log('Submitting match data:', data);
      
      // onSubmit now returns error message or null
      const errorMessage = await onSubmit(data);
      
      if (errorMessage) {
        setError(errorMessage);
        return;
      }
      
      if (!isEditMode) {
        reset();
      }
      
      // Redirect or show success message handled by the parent
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-700 text-white p-4 rounded mb-6">
          <div className="font-bold mb-1">Error</div>
          <div>{error}</div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tournament Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Tournament
          </label>
          <select
            {...register("tournamentId")}
            className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
            disabled={isEditMode || isSubmitting}
          >
            <option value="">Select a tournament</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
          {errors.tournamentId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.tournamentId.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            {...register("status")}
            className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
            disabled={isSubmitting}
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">
              {errors.status.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Round */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Round
          </label>
          <input
            type="number"
            min="1"
            {...register("round")}
            className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
            disabled={isSubmitting}
          />
          {errors.round && (
            <p className="text-red-500 text-sm mt-1">
              {errors.round.message}
            </p>
          )}
        </div>

        {/* Match Number */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Match Number
          </label>
          <input
            type="number"
            min="1"
            {...register("matchNumber")}
            className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
            disabled={isSubmitting}
          />
          {errors.matchNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.matchNumber.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Team 1
          </label>
          <select
            {...register("team1Id")}
            className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
            disabled={isSubmitting || filteredTeams.length === 0}
          >
            <option value="">Select Team 1</option>
            {filteredTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {errors.team1Id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.team1Id.message}
            </p>
          )}
        </div>

        {/* Team 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Team 2
          </label>
          <select
            {...register("team2Id")}
            className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
            disabled={isSubmitting || filteredTeams.length === 0}
          >
            <option value="">Select Team 2</option>
            {filteredTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {errors.team2Id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.team2Id.message}
            </p>
          )}
        </div>
      </div>

      {/* Scheduled Date */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Scheduled Date & Time
        </label>
        <input
          type="datetime-local"
          {...register("scheduledDate")}
          className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
          disabled={isSubmitting}
        />
        {errors.scheduledDate && (
          <p className="text-red-500 text-sm mt-1">
            {errors.scheduledDate.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>Saving...</span>
          ) : isEditMode ? (
            <span>Update Match</span>
          ) : (
            <span>Create Match</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default MatchForm;
