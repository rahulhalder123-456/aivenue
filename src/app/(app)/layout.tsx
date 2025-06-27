"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/'); // Redirect to home page if not logged in
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // Show a loading skeleton or a blank page while checking auth
    return (
        <div className="flex h-screen w-screen bg-background">
            <div className="hidden md:flex flex-col w-64 border-r">
                <div className="p-4"><Skeleton className="h-8 w-3/4" /></div>
                <div className="p-4 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
            <div className="flex-1 p-8">
                <Skeleton className="h-12 w-1/2 mb-8" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
