import { AssistantForm } from "./_components/assistant-form";

export default function AiAssistantPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">AI Assistant</h2>
      </div>
      <p className="text-muted-foreground max-w-2xl">
        Stuck on a problem? Need a quick explanation? Our AI Assistant is here to help. Ask any technical question and get instant, context-aware answers.
      </p>
      
      <div className="mt-8">
        <AssistantForm />
      </div>
    </div>
  );
}