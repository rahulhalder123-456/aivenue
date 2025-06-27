
"use client";

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { generateRoadmapAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rocket, Sparkles, Loader2, Milestone, Lightbulb, Cpu, BookOpen, CheckCircle2, Bookmark, ExternalLink } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function SubmitButton({ hasRoadmap }: { hasRoadmap: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {hasRoadmap ? 'Updating...' : 'Generating...'}
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {hasRoadmap ? 'Update Roadmap' : 'Generate Roadmap'}
                </>
            )}
        </Button>
    );
}

function RoadmapFormBody({ state, resultRef }: { state: any; resultRef: React.RefObject<HTMLDivElement> }) {
  const { pending } = useFormStatus();
  const { toast } = useToast();
  const updateRequestRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (state.message === "Success" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
      if (updateRequestRef.current) {
        updateRequestRef.current.value = '';
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.roadmap]); // Depend on roadmap to run on new generation/update

  const handleSaveRoadmap = async () => {
    if (!user) {
        toast({ title: "Login Required", description: "You must be logged in to save a roadmap.", variant: "destructive" });
        return;
    }
    if (!db) {
      toast({ title: "Configuration Error", description: "Firebase is not configured. Cannot save roadmap.", variant: "destructive" });
      return;
    }
    if (!state.roadmap || !state.careerPath || !state.skillLevel) return;

    const roadmapWithProgress = state.roadmap.map((phase: any) => ({
      ...phase,
      technologies: phase.technologies.map((tech: any) => ({ ...tech, completed: false })),
      resources: phase.resources.map((res: any) => ({ ...res, completed: false })),
    }));

    const newSavedRoadmap = {
      userId: user.uid,
      title: state.careerPath,
      description: `A personalized roadmap for a ${state.skillLevel} ${state.careerPath}.`,
      roadmap: roadmapWithProgress,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "roadmaps"), newSavedRoadmap);
      toast({
        title: "Roadmap Saved!",
        description: "You can view your saved roadmaps on the 'Roadmaps' page.",
      });
    } catch (error) {
      console.error("Failed to save roadmap:", error);
      toast({
        title: "Error",
        description: "Failed to save the roadmap. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="max-w-3xl">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="careerPath">Desired Career Path</Label>
            <Input id="careerPath" name="careerPath" placeholder="e.g., Full-Stack Web Developer, DevOps Engineer" required defaultValue={state.careerPath || ""} />
            {state?.errors?.careerPath && <p className="text-sm font-medium text-destructive">{state.errors.careerPath[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Current Skill Level</Label>
            <Select name="skillLevel" required defaultValue={state.skillLevel || undefined}>
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
          {state.roadmap && (
             <div className="space-y-2 pt-4 animate-in fade-in-50">
                <Label htmlFor="updateRequest" className="text-base font-semibold">Refine Your Roadmap</Label>
                <p className="text-sm text-muted-foreground">
                    Not quite right? Tell the AI what you'd like to change, add, or remove.
                </p>
                <Textarea
                    id="updateRequest"
                    name="updateRequest"
                    ref={updateRequestRef}
                    placeholder="e.g., 'Focus more on backend technologies', 'Add more resources for UI/UX design', 'Is Kubernetes relevant for this path?'"
                />
                <input type="hidden" name="existingRoadmap" value={JSON.stringify(state.roadmap)} />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton hasRoadmap={!!state.roadmap} />
        </CardFooter>
      </Card>
      
      <div ref={resultRef} className="mt-8">
        {pending && (
          <Card className="max-w-3xl animate-in fade-in">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                    {state.roadmap ? 'Updating your roadmap...' : 'Crafting your roadmap...'}
                </CardTitle>
                <CardDescription className="text-center">The AI is thinking. This may take a few moments.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        )}
        {state.roadmap && !pending && (
          <Card className="max-w-3xl animate-in fade-in">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2"><Rocket/> Your Personalized Roadmap</CardTitle>
                <Button variant="outline" size="sm" onClick={handleSaveRoadmap} type="button">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save Roadmap
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {state.roadmap.map((phase: any, index: number) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      <div className="flex items-center gap-4 text-left">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary flex-shrink-0">
                          <Milestone />
                        </div>
                        <div>
                          {phase.title}
                          <p className="text-sm font-normal text-muted-foreground">{phase.duration}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-[52px] ml-6 border-l-2 border-primary/20 space-y-6 pt-4 pb-2">
                       <div className="space-y-2 pl-4">
                        <h4 className="font-semibold flex items-center gap-2"><Lightbulb size={18} /> Goal</h4>
                        <p className="text-muted-foreground">{phase.goal}</p>
                      </div>

                      {phase.technologies?.length > 0 && (
                        <div className="space-y-4 pl-4">
                          <h4 className="font-semibold flex items-center gap-2"><Cpu size={18} /> Technologies & Skills</h4>
                          <ul className="space-y-3">
                            {phase.technologies.map((tech: any, techIndex: number) => (
                              <li key={techIndex} className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-primary mt-1 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">{tech.title}</p>
                                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {phase.resources?.length > 0 && (
                        <div className="space-y-4 pl-4">
                          <h4 className="font-semibold flex items-center gap-2"><BookOpen size={18} /> Learning Resources</h4>
                          <ul className="space-y-3">
                            {phase.resources.map((resource: any, resIndex: number) => (
                              <li key={resIndex} className="flex items-start gap-3">
                                <Bookmark size={18} className="text-primary mt-1 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">{resource.title}</p>
                                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                                  {resource.url && (
                                     <Link href={resource.url} target="_blank" className="flex items-center gap-1 text-primary hover:underline text-sm mt-1">
                                        <ExternalLink size={14} />
                                        View Resource
                                      </Link>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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


export function RoadmapForm() {
  const [state, formAction] = useActionState(generateRoadmapAction, { message: "", errors: {}, roadmap: null, careerPath: "", skillLevel: "" });
  const resultRef = useRef<HTMLDivElement>(null);
  
  return (
    <form action={formAction}>
      <RoadmapFormBody state={state} resultRef={resultRef} />
    </form>
  );
}
