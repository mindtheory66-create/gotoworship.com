const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

function getApiKey(): string | undefined {
  return process.env.DEEPSEEK_API_KEY;
}

export async function deepSeekChatCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; max_tokens?: number; response_format?: { type: 'json_object' | 'text' } }
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.includes('your-')) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  const maxAttempts = 2;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 4000,
          response_format: options?.response_format,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`DeepSeek API error: ${res.status} ${text}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from DeepSeek');
      }
      return content;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxAttempts) {
        console.warn(`DeepSeek attempt ${attempt} failed, retrying...`, lastError.message);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  throw lastError;
}

export async function moderateEventText(text: string): Promise<{ approved: boolean; reason: string }> {
  const systemPrompt = `You are a content moderator for a US place of worship directory. Respond ONLY with valid JSON in the format {"approved": boolean, "reason": string}.`;
  const userPrompt = `Classify whether the following event text contains spam, hate speech, or inappropriate content. Text: "${text.replace(/"/g, '\\"')}"`;

  const content = await deepSeekChatCompletion(systemPrompt, userPrompt, {
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(content);
    return {
      approved: Boolean(parsed.approved),
      reason: String(parsed.reason ?? ''),
    };
  } catch {
    return { approved: false, reason: 'Failed to parse moderation response' };
  }
}
