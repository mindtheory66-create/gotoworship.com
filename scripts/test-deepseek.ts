import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { deepSeekChatCompletion } from '@/lib/ai/deepseek';

async function main() {
  try {
    const res = await deepSeekChatCompletion(
      'You are a helpful assistant.',
      'Write a one-sentence greeting.',
      { temperature: 0.7, max_tokens: 100 }
    );
    console.log('DeepSeek response:', res);
  } catch (err: any) {
    console.error('DeepSeek error:', err.message);
  }
}

main();
