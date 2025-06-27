"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { generateRoadmapAction } from '@/app/actions';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rocket, Sparkles, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Roadmap
                </>
            )}
        </Button>
    );
}

export function RoadmapForm() {
  const [state, formAction] = useFormState(generateRoadmapAction, { message: "", errors: {}, roadmap: null });
  const resultRef = useRef<HTMLDivElement>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.message === "Success" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.message, state.roadmap]);
  
  return (
    <>
      <form action={formAction}>
          <Card className="max-w-3xl">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="careerPath">Desired Career Path</Label>
                <Input id="careerPath" name="careerPath" placeholder="e.g., Full-Stack Web Developer, DevOps Engineer" required />
                {state?.errors?.careerPath && <p className="text-sm font-medium text-destructive">{state.errors.careerPath[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Current Skill Level</Label>
                <Select name="skillLevel" required>
                  <SelectTrigger id="skillLevel">
                    <SelectValue placeholder="Select your skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                 {state?.errors?.skillLevel && <p className="text-sm font-medium text-destructive">{state.errors.skillLevel[0]}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </Card>
      </form>
      
      <div ref={resultRef} className="mt-8">
        {pending && (
          <Card className="max-w-3xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        )}
        {state.roadmap && (
          <Card className="max-w-3xl animate-in fade-in-50">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><Rocket/> Your Personalized Roadmap</h3>
              <pre className="whitespace-pre-wrap font-code bg-secondary p-4 rounded-md text-sm">{state.roadmap}</pre>
            </CardContent>
          </Card>
        )}
        {state.message && state.message !== "Success" && !pending &&(
            <p className="text-destructive mt-4">{state.message}</p>
        )}
      </div>
    </>
  );
}
