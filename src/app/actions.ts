
'use server';

import { generateRoadmap, RoadmapGeneratorInput } from '@/ai/flows/roadmap-generator';
import { askAiAssistant, AskAiAssistantInput } from '@/ai/flows/ai-assistant';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

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
    question: z.string().min(1, 'Question cannot be empty.'),
});

export async function askAiAssistantAction(p0: { message: string; errors: {}; answer: null; }, formData: FormData) {
    const validatedFields = assistantSchema.safeParse({
        question: formData.get('question'),
    });

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.flatten().fieldErrors.question?.[0] || 'Invalid form data.',
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


const settingsSchema = z.object({
  displayName: z.string().min(3, 'Display name must be at least 3 characters long.'),
});

export async function updateUserSettingsAction(prevState: any, formData: FormData) {
  if (!auth || !db) {
      return {
          message: 'Firebase is not configured. Cannot update settings.',
          errors: {},
      }
  }
  
  const user = auth.currentUser;

  if (!user) {
    return {
      message: 'You must be logged in to update settings.',
      errors: {},
    };
  }

  const validatedFields = settingsSchema.safeParse({
    displayName: formData.get('displayName'),
  });

  if (!validatedFields.success) {
    return {
      message: '',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { displayName } = validatedFields.data;

  try {
    await updateProfile(user, { displayName });

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { displayName });

    return { message: 'Success', errors: {} };
  } catch (error) {
    console.error("Error updating settings:", error);
    return {
      message: 'An unexpected error occurred. Please try again.',
      errors: {},
    };
  }
}
