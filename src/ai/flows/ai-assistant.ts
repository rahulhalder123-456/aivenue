'use server';

/**
 * @fileOverview AI assistant to answer technical questions related to the roadmap.
 *
 * - askAiAssistant - A function that answers user's technical questions.
 * - AskAiAssistantInput - The input type for the askAiAssistant function.
 * - AskAiAssistantOutput - The return type for the askAiAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskAiAssistantInputSchema = z.object({
  question: z.string().describe('The technical question to ask the AI assistant.'),
  context: z.string().optional().describe('Any additional context or code snippets related to the question.'),
});
export type AskAiAssistantInput = z.infer<typeof AskAiAssistantInputSchema>;

const AskAiAssistantOutputSchema = z.object({
  answer: z.string().describe('The AI assistant’s answer to the question, including code examples and links to relevant documentation.'),
});
export type AskAiAssistantOutput = z.infer<typeof AskAiAssistantOutputSchema>;

export async function askAiAssistant(input: AskAiAssistantInput): Promise<AskAiAssistantOutput> {
  return askAiAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askAiAssistantPrompt',
  input: {schema: AskAiAssistantInputSchema},
  output: {schema: AskAiAssistantOutputSchema},
  prompt: `You are an AI assistant that helps users with technical questions related to their learning roadmap.

  You should provide concise, helpful answers with code examples and links to relevant documentation.

  Context: {{{context}}}

  Question: {{{question}}}
  `,
});

const askAiAssistantFlow = ai.defineFlow(
  {
    name: 'askAiAssistantFlow',
    inputSchema: AskAiAssistantInputSchema,
    outputSchema: AskAiAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
