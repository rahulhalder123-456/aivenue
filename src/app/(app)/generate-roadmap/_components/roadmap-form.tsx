"use client";

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { generateRoadmapAction } from '@/app/actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rocket, Sparkles, Loader2, Milestone, Lightbulb, Cpu, BookOpen, CheckCircle2, Bookmark, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';


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

function RoadmapFormBody({ state, resultRef }: { state: any; resultRef: React.RefObject<HTMLDivElement> }) {
  const { pending } = useFormStatus();
  const { toast } = useToast();

  useEffect(() => {
    if (state.message === "Success" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.message, state.roadmap]);

  const handleSaveRoadmap = () => {
    if (!state.roadmap || !state.careerPath || !state.skillLevel) return;

    const roadmapWithProgress = state.roadmap.map((phase: any) => ({
      ...phase,
      technologies: phase.technologies.map((tech: any) => ({ ...tech, completed: false })),
      resources: phase.resources.map((res: any) => ({ ...res, completed: false })),
    }));

    const newSavedRoadmap = {
      title: state.careerPath,
      description: `A personalized roadmap for a ${state.skillLevel} ${state.careerPath}.`,
      roadmap: roadmapWithProgress,
      createdAt: new Date().toISOString(),
    };

    try {
      const savedRoadmaps = JSON.parse(localStorage.getItem('savedRoadmaps') || '[]');
      savedRoadmaps.push(newSavedRoadmap);
      localStorage.setItem('savedRoadmaps', JSON.stringify(savedRoadmaps));
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
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
      
      <div ref={resultRef} className="mt-8">
        {pending && (
          <Card className="max-w-3xl">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="pl-16 space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </CardContent>
          </Card>
        )}
        {state.roadmap && (
          <Card className="max-w-3xl animate-in fade-in-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Rocket/> Your Personalized Roadmap</CardTitle>
                <Button variant="outline" size="icon" onClick={handleSaveRoadmap} type="button">
                  <Bookmark className="h-4 w-4" />
                  <span className="sr-only">Save Roadmap</span>
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
  const [state, formAction] = useActionState(generateRoadmapAction, { message: "", errors: {}, roadmap: null, careerPath: null, skillLevel: null });
  const resultRef = useRef<HTMLDivElement>(null);
  
  return (
    <form action={formAction}>
      <RoadmapFormBody state={state} resultRef={resultRef} />
    </form>
  );
}
