
// roadmap-generator.ts
'use server';

/**
 * @fileOverview Generates a personalized learning roadmap based on user's desired career path and current skill level.
 *
 * - generateRoadmap - A function that generates the roadmap.
 * - RoadmapGeneratorInput - The input type for the generateRoadmap function.
 * - RoadmapGeneratorOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RoadmapGeneratorInputSchema = z.object({
  careerPath: z
    .string()
    .describe("The desired career path (e.g., 'Full-Stack Web Developer')."),
  skillLevel: z.string().describe("The current skill level (e.g., 'Beginner')."),
});
export type RoadmapGeneratorInput = z.infer<typeof RoadmapGeneratorInputSchema>;

const RoadmapModuleItemSchema = z.object({
  title: z.string().describe('The title of the item (e.g., a technology, skill, or resource name).'),
  description: z.string().describe('A brief description of the item, explaining its relevance to the desired career path.'),
  url: z.string().optional().describe('A URL to a relevant resource, if applicable.'),
});

const RoadmapPhaseSchema = z.object({
  title: z.string().describe('The title of the roadmap phase (e.g., "Phase 1: Foundations").'),
  duration: z.string().describe('The estimated duration for this phase (e.g., "3-6 Months").'),
  goal: z.string().describe('The primary goal of this phase.'),
  technologies: z.array(RoadmapModuleItemSchema).describe('A list of technologies or skills to learn in this phase.'),
  resources: z.array(RoadmapModuleItemSchema).describe('A list of learning resources for this phase.'),
});

const RoadmapGeneratorOutputSchema = z.object({
  roadmap: z.array(RoadmapPhaseSchema).describe('A personalized learning roadmap with relevant technologies and learning resources, broken down into phases.'),
});
export type RoadmapGeneratorOutput = z.infer<typeof RoadmapGeneratorOutputSchema>;

export async function generateRoadmap(input: RoadmapGeneratorInput): Promise<RoadmapGeneratorOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'roadmapGeneratorPrompt',
  input: {schema: RoadmapGeneratorInputSchema},
  output: {schema: RoadmapGeneratorOutputSchema},
  prompt: `You are an AI career coach who helps people create personalized roadmaps to achieve their desired career path.

You will take the user's desired career path and current skill level, and generate a structured, multi-phase roadmap. For each phase, provide a title, duration, goal, and lists of technologies/skills and learning resources.

For each technology and resource, make sure the description clearly explains why it's relevant to the specified career path. For example, if the career path is Cybersecurity, and a technology is HTML, explain how knowing HTML is important for web vulnerability analysis.

Desired Career Path: {{{careerPath}}}
Current Skill Level: {{{skillLevel}}}

Generate the roadmap.`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: RoadmapGeneratorInputSchema,
    outputSchema: RoadmapGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
