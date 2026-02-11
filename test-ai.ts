
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const models = [
        'gemini-1.5-flash-001',
        'models/gemini-1.5-flash-001',
        'gemini-1.5-pro-001',
        'models/gemini-1.5-pro-001',
        'gemini-1.0-pro',
        'gemini-pro'
    ];

    console.log("Checking API Key:", process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "Present" : "Missing");

    for (const modelName of models) {
        try {
            console.log(`\nTesting model: ${modelName}...`);
            const { text } = await generateText({
                model: google(modelName),
                prompt: 'Hello, say it works.',
            });
            console.log(`✅ Success with ${modelName}: ${text}`);
            return; // Exit on first success
        } catch (error: any) {
            console.log(`❌ Failed with ${modelName}: ${error.message}`);
        }
    }
}

main().catch(console.error);
