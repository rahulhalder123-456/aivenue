import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const roadmapData = {
  title: "Full-Stack Developer Roadmap",
  description: "A complete guide to becoming a Full-Stack Developer in 2024. Track your progress as you learn.",
  sections: [
    {
      title: "Frontend",
      steps: [
        {
          title: "HTML & CSS",
          completed: true,
          resources: [{ title: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" }]
        },
        {
          title: "JavaScript Fundamentals",
          completed: true,
          resources: [{ title: "Eloquent JavaScript", url: "https://eloquentjavascript.net/" }]
        },
        {
          title: "React.js",
          completed: false,
          resources: [{ title: "Official React Docs", url: "https://react.dev/" }, { title: "Next.js Learn", url: "https://nextjs.org/learn" }]
        }
      ]
    },
    {
      title: "Backend",
      steps: [
        {
          title: "Node.js & Express",
          completed: false,
          resources: []
        },
        {
          title: "Databases (SQL & NoSQL)",
          completed: false,
          resources: []
        },
        {
          title: "Authentication & Authorization",
          completed: false,
          resources: []
        },
      ]
    },
    {
        title: "DevOps",
        steps: [
            { title: "Git & Version Control", completed: true, resources: [] },
            { title: "CI/CD", completed: false, resources: [] },
            { title: "Docker", completed: false, resources: [] }
        ]
    }
  ]
};

export default function RoadmapsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Roadmaps</h2>
      </div>
      <p className="text-muted-foreground">Follow our curated learning paths to master new skills and advance your career.</p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{roadmapData.title}</CardTitle>
          <CardDescription>{roadmapData.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {roadmapData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
                <div className="relative pl-6">
                  { sectionIndex < roadmapData.sections.length && <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-3"></div>}
                  
                  <div className="space-y-6">
                    {section.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="relative flex items-start gap-4">
                        <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background -translate-x-1/2 ml-3 z-10"></div>
                        <div className="flex items-center space-x-2 pt-1">
                          <Checkbox id={`step-${sectionIndex}-${stepIndex}`} defaultChecked={step.completed} />
                        </div>
                        <div className="flex-1">
                          <label htmlFor={`step-${sectionIndex}-${stepIndex}`} className="font-medium text-base hover:cursor-pointer">{step.title}</label>
                          {step.resources.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full mt-1">
                              <AccordionItem value="item-1" className="border-b-0">
                                <AccordionTrigger className="py-1 text-sm text-muted-foreground hover:no-underline [&[data-state=open]>svg]:text-primary">View Resources</AccordionTrigger>
                                <AccordionContent>
                                  <div className="pt-2 space-y-2">
                                    {step.resources.map((res, resIndex) => (
                                      <Link href={res.url} target="_blank" key={resIndex} className="flex items-center gap-2 text-sm text-primary hover:underline">
                                        <ExternalLink size={14} />
                                        <span>{res.title}</span>
                                      </Link>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          ) : (
                             <Badge variant="outline" className="ml-2 mt-1">More soon</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
