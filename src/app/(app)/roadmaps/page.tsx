"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, Milestone, Lightbulb, Cpu, BookOpen, CheckCircle2, Bookmark, Trash2, Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SavedRoadmap {
  title: string;
  description: string;
  createdAt: string;
  roadmap: any[];
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Your Saved Roadmaps</h2>
      </div>
      <p className="text-muted-foreground">Here are the learning paths you've generated and saved. Revisit them anytime!</p>

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
                  {savedRoadmap.roadmap.map((phase: any, index: number) => (
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
