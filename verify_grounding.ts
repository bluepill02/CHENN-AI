import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config(); // Also try default .env as fallback

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ VITE_GEMINI_API_KEY not found in .env file');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = 'gemini-2.0-flash-lite-preview-02-05';

async function testGrounding() {
    console.log('🚀 Testing Google Grounding with Gemini 2.0 Flash Lite...');

    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            tools: [{ googleSearch: {} } as any]
        });

        const location = 'Anna Nagar';
        const prompt = `Find the latest live updates for **${location}, Chennai**, regarding Weather, Traffic, and Breaking News right now. 
            Summarize it into a single Tanglish (Tamil + English) ticker line with emojis. 
            Format: "📢 [Weather] | [Traffic] | [News]"
            Keep it concise and engaging.`;

        console.log(`\n📝 Prompt: ${prompt}`);
        console.log('\n⏳ Generating content...');

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('\n✅ Response received:');
        console.log('---------------------------------------------------');
        console.log(text);
        console.log('---------------------------------------------------');

        if (text.length > 10) {
            console.log('\n🎉 Test PASSED: Received meaningful response.');
        } else {
            console.warn('\n⚠️ Test WARNING: Response seems too short.');
        }

    } catch (error) {
        console.error('\n❌ Test FAILED:', error);
    }
}

testGrounding();
