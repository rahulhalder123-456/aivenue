'use client';

import { useAuth } from '@/contexts/auth-context';
import { redirect } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    // AuthProvider shows a loading spinner, so this is just a fallback.
    return null;
  }
  
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
