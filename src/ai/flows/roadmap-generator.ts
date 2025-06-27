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
    .describe('The desired career path (e.g., \'Full-Stack Web Developer\').'),
  skillLevel: z.string().describe('The current skill level (e.g., \'Beginner\').'),
});
export type RoadmapGeneratorInput = z.infer<typeof RoadmapGeneratorInputSchema>;

const RoadmapGeneratorOutputSchema = z.object({
  roadmap: z.string().describe('A personalized learning roadmap with relevant technologies and learning resources.'),
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

You will take the user's desired career path and current skill level, and generate a roadmap with relevant technologies and learning resources.

Desired Career Path: {{{careerPath}}}
Current Skill Level: {{{skillLevel}}}

Roadmap:`,
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
