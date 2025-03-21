// app/page.jsx - Homepage
import Link from 'next/link';
import Image from 'next/image';
import { FeaturedTournaments } from '@/components/tournament/FeaturedTournaments';
import { LatestNews } from '@/components/news/LatestNews';
import { LiveMatches } from '@/components/match/LiveMatches';
import { UpcomingMatches } from '@/components/match/UpcomingMatches';
import { TopTeams } from '@/components/team/TopTeams';
import { HeroSection } from '@/components/layout/HeroSection';

export const metadata = {
  title: 'PUBG Tournament Platform - Home',
  description: 'The ultimate platform for PUBG esports tournaments, teams, and players',
};

export default async function HomePage() {
  // Fetch data for homepage components
  // In a real app, this would connect to your database via Prisma
  
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Live Matches */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            Live Now
          </h2>
          <LiveMatches />
        </div>
      </section>
      
      {/* Featured Tournaments */}
      <section className="py-12 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8">Featured Tournaments</h2>
          <FeaturedTournaments />
          <div className="mt-8 text-center">
            <Link 
              href="/tournaments" 
              className="inline-block bg-purple-600 hover:bg-purple-700 transition-colors text-white font-semibold py-3 px-6 rounded-lg"
            >
              View All Tournaments
            </Link>
          </div>
        </div>
      </section>
      
      {/* Latest News & Upcoming Matches Split Section */}
      <section className="py-12 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Latest News - 2/3 width on desktop */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-white mb-6">Latest News</h2>
              <LatestNews />
              <div className="mt-6">
                <Link 
                  href="/news" 
                  className="text-purple-400 hover:text-purple-300 font-medium flex items-center"
                >
                  View All News
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Upcoming Matches - 1/3 width on desktop */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Upcoming Matches</h2>
              <UpcomingMatches />
              <div className="mt-6">
                <Link 
                  href="/matches" 
                  className="text-purple-400 hover:text-purple-300 font-medium flex items-center"
                >
                  View All Matches
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Top Teams Section */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8">Top Teams</h2>
          <TopTeams />
          <div className="mt-8 text-center">
            <Link 
              href="/teams" 
              className="inline-block bg-gray-700 hover:bg-gray-600 transition-colors text-white font-semibold py-3 px-6 rounded-lg"
            >
              View All Teams
            </Link>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-purple-800 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join the Community</h2>
          <p className="text-lg text-purple-100 mb-8 max-w-3xl mx-auto">
            Create an account to follow your favorite teams, get notifications for upcoming matches, and join the conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="inline-block bg-white text-purple-800 hover:bg-gray-100 transition-colors font-bold py-3 px-8 rounded-lg"
            >
              Sign Up
            </Link>
            <Link 
              href="/login" 
              className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:bg-opacity-10 transition-colors font-bold py-3 px-8 rounded-lg"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}