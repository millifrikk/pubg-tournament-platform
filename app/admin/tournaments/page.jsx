// app/admin/tournaments/page.jsx
import { Suspense } from 'react';
import Link from 'next/link';
import { AdminPageTitle } from '@/components/admin/AdminPageTitle';
import { TournamentList } from '@/components/admin/tournament/TournamentList';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusIcon } from 'lucide-react';

export const metadata = {
  title: 'Tournament Management | Admin Dashboard',
};

export default function AdminTournamentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <AdminPageTitle title="Tournament Management" description="Create and manage tournaments" />
        <Link href="/admin/tournaments/new">
          <Button className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Create Tournament
          </Button>
        </Link>
      </div>
      
      <Suspense fallback={<TournamentsListSkeleton />}>
        <TournamentList />
      </Suspense>
    </div>
  );
}

function TournamentsListSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 text-sm font-medium text-gray-200">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5">Tournament</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Dates</div>
          <div className="col-span-2">Teams</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>
      <div className="divide-y divide-gray-700">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="bg-gray-900 px-4 py-3">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-5 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="col-span-2">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-4 w-10" />
              </div>
              <div className="col-span-1 flex justify-end gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}