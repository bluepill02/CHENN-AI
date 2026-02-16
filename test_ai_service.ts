import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testGroq() {
    console.log('Testing Groq Direct...');
    const key = process.env.VITE_GROQ_API_KEY;
    console.log('Key length:', key ? key.length : 0);

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'hi' }],
                max_tokens: 10
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text.substring(0, 500)); // Limit output
    } catch (e) {
        console.error('Error:', e);
    }
}

testGroq();
