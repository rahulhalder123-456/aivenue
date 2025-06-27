"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, Milestone, Lightbulb, Cpu, BookOpen, Bookmark, Trash2, Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

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
  title: string;
  description: string;
  createdAt: string;
  roadmap: RoadmapPhase[];
}

export default function RoadmapsPage() {
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const roadmapsFromStorage = JSON.parse(localStorage.getItem("savedRoadmaps") || "[]");
      setSavedRoadmaps(roadmapsFromStorage);
    } catch (error) {
      console.error("Failed to load roadmaps from storage", error);
      setSavedRoadmaps([]);
    }
  }, []);

  const handleDelete = (indexToDelete: number) => {
    const updatedRoadmaps = savedRoadmaps.filter((_, index) => index !== indexToDelete);
    localStorage.setItem('savedRoadmaps', JSON.stringify(updatedRoadmaps));
    setSavedRoadmaps(updatedRoadmaps);
    toast({
      title: "Roadmap Deleted",
      description: "The roadmap has been removed from your saved list.",
    });
  };

  const handleToggle = (roadmapIndex: number, phaseIndex: number, itemType: 'technologies' | 'resources', itemIndex: number) => {
    const newSavedRoadmaps = [...savedRoadmaps];
    const roadmapToUpdate = newSavedRoadmaps[roadmapIndex];
    if (roadmapToUpdate && roadmapToUpdate.roadmap[phaseIndex] && roadmapToUpdate.roadmap[phaseIndex][itemType] && roadmapToUpdate.roadmap[phaseIndex][itemType][itemIndex]) {
        const itemToUpdate = roadmapToUpdate.roadmap[phaseIndex][itemType][itemIndex];
        itemToUpdate.completed = !itemToUpdate.completed;
        
        setSavedRoadmaps(newSavedRoadmaps);
        localStorage.setItem('savedRoadmaps', JSON.stringify(newSavedRoadmaps));
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Your Saved Roadmaps</h2>
      </div>
      <p className="text-muted-foreground">Here are the learning paths you've generated and saved. Track your progress and keep learning!</p>

      <div className="mt-8 space-y-6">
        {savedRoadmaps.length > 0 ? (
          savedRoadmaps.map((savedRoadmap, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{savedRoadmap.title}</CardTitle>
                    <CardDescription>{savedRoadmap.description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(idx)}>
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
                    <AccordionItem value={`item-${idx}-${index}`} key={index}>
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
                                    id={`tech-${idx}-${index}-${techIndex}`}
                                    checked={!!tech.completed}
                                    onCheckedChange={() => handleToggle(idx, index, 'technologies', techIndex)}
                                    className="mt-1 flex-shrink-0"
                                  />
                                  <label htmlFor={`tech-${idx}-${index}-${techIndex}`} className="space-y-1 leading-none cursor-pointer flex-1">
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
                                    id={`res-${idx}-${index}-${resIndex}`}
                                    checked={!!resource.completed}
                                    onCheckedChange={() => handleToggle(idx, index, 'resources', resIndex)}
                                    className="mt-1 flex-shrink-0"
                                  />
                                  <label htmlFor={`res-${idx}-${index}-${resIndex}`} className="space-y-1 leading-none cursor-pointer flex-1">
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
