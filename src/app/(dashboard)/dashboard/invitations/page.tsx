"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function MyInvitationsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile page where invitations are now managed
    router.replace('/dashboard/profile');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <LoadingSpinner />
    </div>
  );
}