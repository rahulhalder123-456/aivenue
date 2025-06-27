'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BrainCircuit, Bot, ArrowRight, Users, Check, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span className="font-bold">Aivenue</span>
          </Link>
          <nav className="flex flex-1 items-center justify-end space-x-2">
            {loading ? (
                <>
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                </>
            ) : user ? (
                <Button asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
            ) : (
                <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
              Build Your Developer Career with AI-Powered Roadmaps
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Stop guessing. Start building. Aivenue creates personalized, step-by-step learning paths to help you achieve your career goals faster.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href={user ? '/dashboard' : '/signup'}>
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight font-headline">All The Tools You Need to Succeed</h2>
                    <p className="mt-2 text-muted-foreground max-w-xl mx-auto">From AI-driven planning to expert help, we've got you covered.</p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10 text-primary"><BrainCircuit className="h-6 w-6" /></div>
                            <CardTitle>AI Roadmap Generator</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Get a personalized learning path tailored to your specific career goals and skill level in seconds.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                           <div className="p-3 rounded-full bg-primary/10 text-primary"><Bot className="h-6 w-6" /></div>
                            <CardTitle>AI Assistant</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Stuck on a concept? Get instant, context-aware answers to your technical questions, 24/7.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10 text-primary"><Users className="h-6 w-6" /></div>
                            <CardTitle>Progress Tracking</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">Save your roadmaps, track completed milestones, and stay motivated on your learning journey.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        {/* Live Traffic Section */}
         <section className="py-20">
            <div className="container">
                <div className="grid gap-8 md:grid-cols-2 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight font-headline">Join a Thriving Community of Learners</h2>
                        <p className="mt-4 text-lg text-muted-foreground">You're not alone. Thousands of developers are using Aivenue to level up their skills and advance their careers.</p>
                        <ul className="mt-6 space-y-4">
                           <li className="flex items-start">
                                <Check className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold">Live Traffic</h4>
                                    <p className="text-muted-foreground">See developers from around the world generating roadmaps in real-time.</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <Check className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold">10,000+ Roadmaps Generated</h4>
                                    <p className="text-muted-foreground">Our AI has already crafted thousands of unique learning paths.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <Card className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Live User Activity</h3>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <span className="text-sm text-muted-foreground">Live</span>
                                </div>
                            </div>
                            <div className="mt-4 h-64 bg-secondary rounded-lg flex items-center justify-center">
                                <Globe className="h-32 w-32 text-muted-foreground/50" data-ai-hint="world map" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container py-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Aivenue. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
