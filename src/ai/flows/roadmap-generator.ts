// roadmap-generator.ts
'use server';

import OpenAI from 'openai';

// Define standard types for our frontend
export type RoadmapGeneratorInput = {
  careerPath: string;
  skillLevel: string;
  existingRoadmap?: string;
  updateRequest?: string;
};

export type RoadmapModuleItem = {
  title: string;
  description: string;
  url?: string;
};

export type RoadmapPhase = {
  title: string;
  duration: string;
  goal: string;
  technologies: RoadmapModuleItem[];
  resources: RoadmapModuleItem[];
};

export type RoadmapGeneratorOutput = {
  roadmap: RoadmapPhase[];
};

const SYSTEM_PROMPT = `
You are an expert career coach and AI roadmap generator.
Create a structured 3-phase learning roadmap for the specified career path and skill level.
Your output MUST be a valid JSON object matching the following structure exactly, with no additional text or markdown formatting outside the JSON:

{
  "roadmap": [
    {
      "title": "Phase 1: Foundations",
      "duration": "1-2 Months",
      "goal": "Understand the core principles...",
      "technologies": [
        { "title": "Concept 1", "description": "Description of concept 1" }
      ],
      "resources": [
        { "title": "Resource 1", "description": "Description of resource", "url": "https://example.com" }
      ]
    }
    // Phase 2 and Phase 3 follow the same structure...
  ]
}
`;

async function generateWithModel(client: OpenAI, modelName: string, prompt: string): Promise<string> {
  const completion = await client.chat.completions.create({
    model: modelName,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return completion.choices[0]?.message?.content || "";
}

async function judgeResponses(client: OpenAI, judgeModel: string, prompt: string, responseA: string, responseB: string): Promise<string> {
  const judgePrompt = `
You are a master evaluator and AI judge.
A user asked for a learning roadmap with the following prompt:
"${prompt}"

Here are two different generated roadmaps (A and B):

--- ROADMAP A ---
${responseA}

--- ROADMAP B ---
${responseB}

Your task is to compare them, extract the best ideas from both, and generate the ultimate, perfected roadmap. 
Your output MUST be a valid JSON object matching the requested schema exactly, with no markdown formatting or extra text.
`;

  const completion = await client.chat.completions.create({
    model: judgeModel,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: judgePrompt }
    ],
    temperature: 0.3,
    max_tokens: 3000,
  });

  return completion.choices[0]?.message?.content || "";
}

function cleanJSON(text: string): any {
  try {
    // Attempt to strip out markdown code blocks if the model wrapped it in ```json
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse JSON output from the AI model: " + text);
  }
}

export async function generateRoadmap(input: RoadmapGeneratorInput): Promise<RoadmapGeneratorOutput> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY_MISSING");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });

  const userPrompt = `Desired Career Path: ${input.careerPath}\nCurrent Skill Level: ${input.skillLevel}`;

  // Step 1: Parallel Generation (Mixture of Experts)
  const generatorA = "meta/llama-3.1-8b-instruct";
  const generatorB = "google/gemma-2-9b-it";

  const [resA, resB] = await Promise.all([
    generateWithModel(client, generatorA, userPrompt).catch(e => { console.error("Error from A:", e); return ""; }),
    generateWithModel(client, generatorB, userPrompt).catch(e => { console.error("Error from B:", e); return ""; })
  ]);

  if (!resA && !resB) {
    throw new Error("Both generator models failed to produce a response.");
  }

  // Step 2: The Judge
  const judgeModel = "meta/llama-3.1-70b-instruct"; // Faster judge model
  
  // If one failed, just parse the successful one. If both succeeded, judge them.
  let finalJsonString = resA || resB;
  
  if (resA && resB) {
    finalJsonString = await judgeResponses(client, judgeModel, userPrompt, resA, resB);
  }

  return cleanJSON(finalJsonString) as RoadmapGeneratorOutput;
}
