import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, BrainCircuit, Network } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Welcome to your Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Milestones
            </CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              on the Full-Stack roadmap
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              AI Assistant
            </CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Queries</div>
            <p className="text-xs text-muted-foreground">
              in the last 24 hours
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
                Active Streak
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Days</div>
            <p className="text-xs text-muted-foreground">
              Keep up the great work!
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Featured Roadmaps</CardTitle>
            <CardDescription>
              Explore our most popular learning paths.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary">
              <div>
                <h3 className="font-semibold">Full-Stack Developer</h3>
                <p className="text-sm text-muted-foreground">From zero to hero in web development.</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/roadmaps">
                  View <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary">
              <div>
                <h3 className="font-semibold">DevOps Engineer</h3>
                <p className="text-sm text-muted-foreground">Master deployment, automation, and infrastructure.</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="#">
                  View <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>AI-Powered Tools</CardTitle>
            <CardDescription>
              Accelerate your learning with our smart tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/generate-roadmap" className="block p-4 rounded-lg hover:bg-secondary">
              <div className="flex items-start gap-4">
                <BrainCircuit className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">AI Roadmap Generator</h3>
                  <p className="text-sm text-muted-foreground">
                    Get a personalized learning path in seconds.
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/ai-assistant" className="block p-4 rounded-lg hover:bg-secondary">
              <div className="flex items-start gap-4">
                <Bot className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Your on-demand expert for any technical question.
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
