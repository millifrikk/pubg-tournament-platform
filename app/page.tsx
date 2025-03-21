import Link from "next/link";
import { Button } from "@/components/ui/button/Button";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-gray-900/70">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/pubg-hero.jpg')",
              opacity: 0.3,
            }}
          ></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              PUBG Tournament Platform
            </h1>
            <p className="mt-6 max-w-xl text-xl text-gray-300">
              The ultimate platform for organizing, participating in, and following
              competitive PUBG tournaments.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link href="/tournaments" passHref>
                <Button size="lg">Explore Tournaments</Button>
              </Link>
              <Link href="/auth/register" passHref>
                <Button variant="outline" size="lg">
                  Sign Up Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Platform Features
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Everything you need for a successful PUBG tournament experience
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg bg-gray-800 p-6">
              <div className="mb-4 h-12 w-12 rounded-md bg-purple-700 p-2 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Team Management</h3>
              <p className="mt-2 text-gray-400">
                Register your team, manage players, and track performance across
                tournaments.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg bg-gray-800 p-6">
              <div className="mb-4 h-12 w-12 rounded-md bg-purple-700 p-2 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">
                Tournament Brackets
              </h3>
              <p className="mt-2 text-gray-400">
                Visualize tournament progression with interactive bracket displays
                and real-time updates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg bg-gray-800 p-6">
              <div className="mb-4 h-12 w-12 rounded-md bg-purple-700 p-2 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">
                Advanced Statistics
              </h3>
              <p className="mt-2 text-gray-400">
                Detailed player and team statistics with performance tracking
                across matches and tournaments.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg bg-gray-800 p-6">
              <div className="mb-4 h-12 w-12 rounded-md bg-purple-700 p-2 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">
                Tournament Alerts
              </h3>
              <p className="mt-2 text-gray-400">
                Follow teams and tournaments to receive notifications about
                matches, results, and updates.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg bg-gray-800 p-6">
              <div className="mb-4 h-12 w-12 rounded-md bg-purple-700 p-2 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">
                Tournament Scheduling
              </h3>
              <p className="mt-2 text-gray-400">
                Create and manage tournament schedules with automatic bracket
                progression and match generation.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg bg-gray-800 p-6">
              <div className="mb-4 h-12 w-12 rounded-md bg-purple-700 p-2 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">
                Customizable Formats
              </h3>
              <p className="mt-2 text-gray-400">
                Support for various tournament formats including single
                elimination, double elimination, and round-robin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-xl text-purple-200">
              Join the PUBG Tournament Platform today and take your competitive
              gaming to the next level.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/auth/register" passHref>
                <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-100">
                  Sign Up Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}