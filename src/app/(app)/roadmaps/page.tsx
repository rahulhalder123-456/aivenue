
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, Milestone, Lightbulb, Cpu, BookOpen, Trash2, Rocket, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, type Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

interface RoadmapItem {
  title: string;
  description: string;
  url?: string;
  completed: boolean;
}

interface RoadmapPhase {
  title: string;
  duration: string;
  goal: string;
  technologies: RoadmapItem[];
  resources: RoadmapItem[];
}

interface SavedRoadmap {
  id: string;
  title: string;
  description: string;
  createdAt: Timestamp | null;
  roadmap: RoadmapPhase[];
}

export default function RoadmapsPage() {
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRoadmaps = useCallback(async () => {
    if (!user) return;
    if (!db) {
        toast({ title: "Configuration Error", description: "Firebase is not configured. Cannot load roadmaps.", variant: "destructive" });
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, "roadmaps"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const roadmapsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedRoadmap));
      
      roadmapsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate() ?? new Date(0);
        const dateB = b.createdAt?.toDate() ?? new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setSavedRoadmaps(roadmapsData);
    } catch (error) {
      console.error("Failed to load roadmaps:", error);
      toast({ title: "Error", description: "Could not fetch your roadmaps.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchRoadmaps();
    } else {
      setLoading(false);
    }
  }, [user, fetchRoadmaps]);

  const handleDelete = async (roadmapId: string) => {
    if (!db) {
        toast({ title: "Error", description: "Firebase is not configured.", variant: "destructive" });
        return;
    }
    const originalRoadmaps = [...savedRoadmaps];
    setSavedRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
    try {
        await deleteDoc(doc(db, "roadmaps", roadmapId));
        toast({
            title: "Roadmap Deleted",
            description: "The roadmap has been removed from your saved list.",
        });
    } catch (error) {
        toast({ title: "Error", description: "Failed to delete roadmap.", variant: "destructive" });
        setSavedRoadmaps(originalRoadmaps);
    }
  };

  const handleToggle = async (roadmapId: string, phaseIndex: number, itemType: 'technologies' | 'resources', itemIndex: number) => {
    const originalRoadmaps = [...savedRoadmaps];
    const newSavedRoadmaps = savedRoadmaps.map(r => {
        if (r.id === roadmapId) {
            const newRoadmap = { ...r };
            // Deep copy to avoid mutation issues
            newRoadmap.roadmap = JSON.parse(JSON.stringify(newRoadmap.roadmap));
            const item = newRoadmap.roadmap[phaseIndex][itemType][itemIndex];
            item.completed = !item.completed;
            return newRoadmap;
        }
        return r;
    });
    setSavedRoadmaps(newSavedRoadmaps);

    const roadmapToUpdate = newSavedRoadmaps.find(r => r.id === roadmapId);
    if (!roadmapToUpdate) return;

    if (!db) {
        toast({ title: "Error", description: "Firebase is not configured.", variant: "destructive" });
        setSavedRoadmaps(originalRoadmaps);
        return;
    }
    
    try {
        const roadmapRef = doc(db, "roadmaps", roadmapId);
        await updateDoc(roadmapRef, { roadmap: roadmapToUpdate.roadmap });
    } catch (error) {
        console.error("Failed to update roadmap", error);
        toast({ title: "Error", description: "Could not sync your progress.", variant: "destructive" });
        setSavedRoadmaps(originalRoadmaps);
    }
  };

  const calculatePhaseProgress = (phase: RoadmapPhase) => {
    const totalItems = (phase.technologies?.length || 0) + (phase.resources?.length || 0);
    if (totalItems === 0) return 0;
    const completedItems = 
        (phase.technologies?.filter(item => item.completed).length || 0) + 
        (phase.resources?.filter(item => item.completed).length || 0);
    return (completedItems / totalItems) * 100;
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <Skeleton className="h-10 w-1/3" />
        </div>
        <Skeleton className="h-6 w-1/2" />
        <div className="mt-8 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Your Saved Roadmaps</h2>
      </div>
      <p className="text-muted-foreground">Here are the learning paths you've generated and saved. Track your progress and keep learning!</p>

      <div className="mt-8 space-y-6">
        {savedRoadmaps.length > 0 ? (
          savedRoadmaps.map((savedRoadmap) => (
            <Card key={savedRoadmap.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{savedRoadmap.title}</CardTitle>
                    <CardDescription>{savedRoadmap.description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(savedRoadmap.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete roadmap</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {savedRoadmap.roadmap.map((phase, index) => {
                    const progress = calculatePhaseProgress(phase);
                    return (
                    <AccordionItem value={`item-${savedRoadmap.id}-${index}`} key={index}>
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
                          <div className="flex justify-between items-center mb-1">
                              <h4 className="font-semibold">Phase Progress</h4>
                              <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                         <div className="space-y-2 pl-4">
                          <h4 className="font-semibold flex items-center gap-2"><Lightbulb size={18} /> Goal</h4>
                          <p className="text-muted-foreground">{phase.goal}</p>
                        </div>

                        {phase.technologies?.length > 0 && (
                          <div className="space-y-4 pl-4">
                            <h4 className="font-semibold flex items-center gap-2"><Cpu size={18} /> Technologies & Skills</h4>
                            <ul className="space-y-3">
                              {phase.technologies.map((tech, techIndex) => (
                                <li key={techIndex} className="flex items-start gap-3">
                                  <Checkbox
                                    id={`tech-${savedRoadmap.id}-${index}-${techIndex}`}
                                    checked={!!tech.completed}
                                    onCheckedChange={() => handleToggle(savedRoadmap.id, index, 'technologies', techIndex)}
                                    className="mt-1 flex-shrink-0"
                                  />
                                  <label htmlFor={`tech-${savedRoadmap.id}-${index}-${techIndex}`} className="space-y-1 leading-none cursor-pointer flex-1">
                                    <p className="font-medium">{tech.title}</p>
                                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {phase.resources?.length > 0 && (
                          <div className="space-y-4 pl-4">
                            <h4 className="font-semibold flex items-center gap-2"><BookOpen size={18} /> Learning Resources</h4>
                            <ul className="space-y-3">
                              {phase.resources.map((resource, resIndex) => (
                                <li key={resIndex} className="flex items-start gap-3">
                                   <Checkbox
                                    id={`res-${savedRoadmap.id}-${index}-${resIndex}`}
                                    checked={!!resource.completed}
                                    onCheckedChange={() => handleToggle(savedRoadmap.id, index, 'resources', resIndex)}
                                    className="mt-1 flex-shrink-0"
                                  />
                                  <label htmlFor={`res-${savedRoadmap.id}-${index}-${resIndex}`} className="space-y-1 leading-none cursor-pointer flex-1">
                                    <p className="font-medium">{resource.title}</p>
                                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                                    {resource.url && (
                                       <Link href={resource.url} target="_blank" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-primary hover:underline text-sm mt-1">
                                          <ExternalLink size={14} />
                                          View Resource
                                        </Link>
                                    )}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="w-full text-center p-8">
            <div className="mx-auto bg-secondary text-secondary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <Rocket className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-headline">No Saved Roadmaps Yet</CardTitle>
            <CardDescription className="mt-2 mb-4 max-w-md mx-auto">
              Go to the AI Generator to create and save your first personalized learning roadmap!
            </CardDescription>
            <Button asChild>
              <Link href="/generate-roadmap">Generate a Roadmap</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
