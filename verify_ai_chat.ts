
import dotenv from 'dotenv';
import path from 'path';
import { AiService } from './services/AiService';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyChat() {
    console.log('Verifying AiService.chat...');
    try {
        const response = await AiService.chat('Hello, are you working?');
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}

verifyChat();
