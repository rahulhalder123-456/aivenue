import { config } from 'dotenv';
config({ path: '.env.local' });
import { generateRoadmap } from './src/ai/flows/roadmap-generator';
async function test() {
  console.log("Generating roadmap...");
  const res = await generateRoadmap({ careerPath: 'quantum computing', skillLevel: 'Beginner' });
  console.log(JSON.stringify(res, null, 2));
}

test();
