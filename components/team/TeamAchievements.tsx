interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  icon?: string;
}

interface TeamAchievementsProps {
  achievements: Achievement[];
}

export default function TeamAchievements({ achievements }: TeamAchievementsProps) {
  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <h3 className="mb-4 text-lg font-bold text-white">Achievements</h3>
      
      {achievements.length === 0 ? (
        <p className="text-center text-gray-400 py-4">No achievements yet.</p>
      ) : (
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-start space-x-3 rounded-md bg-gray-700 p-3">
              {achievement.icon ? (
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-700">
                    <span className="text-xl">{achievement.icon}</span>
                  </div>
                </div>
              ) : (
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-6 w-6 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-md font-medium text-white">{achievement.title}</h4>
                <p className="text-sm text-gray-400">{achievement.description}</p>
                <p className="mt-1 text-xs text-purple-400">
                  {typeof achievement.date === "string"
                    ? achievement.date
                    : achievement.date.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}