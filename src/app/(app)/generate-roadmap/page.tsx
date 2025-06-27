import { RoadmapForm } from "./_components/roadmap-form";

export default function GenerateRoadmapPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">AI Roadmap Generator</h2>
      </div>
      <p className="text-muted-foreground max-w-2xl">
        Tell us about your career aspirations and current skill level, and our AI will craft a personalized learning roadmap just for you. Get step-by-step guidance on what to learn and the best resources to use.
      </p>
      
      <div className="mt-8">
        <RoadmapForm />
      </div>
    </div>
  );
}
