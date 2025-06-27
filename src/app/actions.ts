'use server';

import { generateRoadmap, RoadmapGeneratorInput } from '@/ai/flows/roadmap-generator';
import { askAiAssistant, AskAiAssistantInput } from '@/ai/flows/ai-assistant';
import { z } from 'zod';

const roadmapSchema = z.object({
  careerPath: z.string().min(3, 'Career path is required.'),
  skillLevel: z.string().min(1, 'Skill level is required.'),
  updateRequest: z.string().optional(),
  existingRoadmap: z.string().optional(),
});

export async function generateRoadmapAction(prevState: any, formData: FormData) {
  const formDataObj = Object.fromEntries(formData.entries());
  const validatedFields = roadmapSchema.safeParse(formDataObj);

  if (!validatedFields.success) {
    return {
      roadmap: prevState.roadmap,
      careerPath: formDataObj.careerPath as string,
      skillLevel: formDataObj.skillLevel as string,
      message: '',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const inputData = { ...validatedFields.data };
    if (inputData.existingRoadmap) {
        // The AI expects a plain object, not a stringified one.
        // Let's parse it back. The schema in the flow expects a string,
        // but it's really just for type checking on the prompt side.
        // Let's keep it simple.
        // The prompt template will receive it as a string and that's fine.
    }

    const result = await generateRoadmap(inputData as RoadmapGeneratorInput);
    return { 
      message: 'Success', 
      roadmap: result.roadmap, 
      errors: {},
      careerPath: validatedFields.data.careerPath,
      skillLevel: validatedFields.data.skillLevel,
    };
  } catch (error) {
    console.error(error);
    return { 
        roadmap: prevState.roadmap,
        careerPath: formDataObj.careerPath as string,
        skillLevel: formDataObj.skillLevel as string,
        message: 'An error occurred while generating the roadmap.',
        errors: {}
    };
  }
}


const assistantSchema = z.object({
    question: z.string().min(10, 'Question must be at least 10 characters.'),
});

export async function askAiAssistantAction(prevState: any, formData: FormData) {
    const formDataObj = Object.fromEntries(formData.entries());
    const validatedFields = assistantSchema.safeParse(formDataObj);

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            errors: validatedFields.error.flatten().fieldErrors,
            answer: null,
        };
    }
    
    try {
        const result = await askAiAssistant({ question: validatedFields.data.question });
        return { message: 'Success', answer: result.answer, errors: {} };
    } catch (error) {
        console.error(error);
        return { message: 'An error occurred while getting an answer.', answer: null, errors: {} };
    }
}
