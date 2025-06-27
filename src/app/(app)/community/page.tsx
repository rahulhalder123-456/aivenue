import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";

export default function CommunityPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <Users className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-headline">Community Hub</CardTitle>
          <CardDescription>
            Connect with fellow learners, ask questions, and share your progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Our community forums are coming soon! We're building a supportive space for developers of all levels to collaborate and grow together.
          </p>
          <Button asChild>
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
