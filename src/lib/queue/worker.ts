import { createAdminClient } from '@/lib/supabase/admin';
import { processPlaceImages } from '@/lib/image/image-processor';
import { fetchNearestStations } from '@/lib/geo/transit';
import { buildPlaceContentPrompt, buildFallbackContent } from '@/lib/ai/content-prompt';
import { deepSeekChatCompletion } from '@/lib/ai/deepseek';
import { parseNumber } from '@/lib/utils/csv-parser';
import { cleanAiContent } from '@/lib/utils/clean-ai-content';
import { Job } from './types';

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

async function expandWithAi(content: string, placeName: string): Promise<string> {
  const systemPrompt = `You are an expert SEO content editor for a US place of worship directory.`;
  const userPrompt = `The following article about ${placeName} is helpful but too short. Expand it to at least 1,500 words total by adding more useful detail, warm community descriptions, and practical visitor advice. Keep the Markdown headings and factual tone. Use bullet lists where appropriate. Do not use em-dashes or en-dashes; use hyphens (-) instead. Do NOT add a title heading and do NOT include any introduction, preamble, or meta commentary. Return only the expanded article.\n\n${content}`;
  return await deepSeekChatCompletion(systemPrompt, userPrompt, { temperature: 0.7, max_tokens: 4000 });
}

export async function runWorkerLoop(batchSize = 10, concurrency = 2) {
  const admin = createAdminClient();

  const { data: jobs, error } = await admin
    .from('job_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (error) {
    console.error('Failed to fetch jobs:', error.message);
    return 0;
  }
  if (!jobs || jobs.length === 0) {
    console.log('No pending jobs');
    return 0;
  }

  console.log(`Processing ${jobs.length} job(s) with concurrency ${concurrency}`);
  for (let i = 0; i < jobs.length; i += concurrency) {
    const chunk = (jobs as Job[]).slice(i, i + concurrency);
    await Promise.all(
      chunk.map((job, idx) => {
        const label = `[${i + idx + 1}/${jobs.length}]`;
        console.log(`${label} Processing job ${job.id} for place ${job.payload.placeId}`);
        return processJob(job, label);
      })
    );
  }

  return jobs.length;
}

export async function processJob(job: Job, label = '') {
  const admin = createAdminClient();
  const { placeId, row } = job.payload;
  const log = (message: string) => console.log(`${label ? label + ' ' : ''}${message}`);

  await admin
    .from('job_queue')
    .update({ status: 'processing', attempts: job.attempts + 1, updated_at: new Date().toISOString() })
    .eq('id', job.id);

  try {
    const { data: place, error: placeError } = await admin.from('places').select('*').eq('id', placeId).single();
    if (placeError || !place) throw new Error('Place not found');

    // Transport enrichment
    const lat = parseNumber(row.latitude) ?? (place.latitude as number);
    const lng = parseNumber(row.longitude) ?? (place.longitude as number);
    const stations = await fetchNearestStations(lat, lng);
    const transportInfo = {
      nearestStations: stations.map((s) => s.name),
      coordinates: { lat, lng },
    };

    // Process images and generate content in parallel
    const imageUrls = [row.image_url1, row.image_url2, row.image_url3].filter(Boolean) as string[];
    const imagePromise = (async () => {
      if (imageUrls.length === 0) return [] as { url: string; alt_text: string | null }[];
      log(`Downloading ${imageUrls.length} image(s)`);
      const uploaded = await processPlaceImages(placeId, imageUrls);
      log(`Uploaded ${uploaded.length} image(s)`);
      return uploaded;
    })();

    const contentPromise = (async () => {
      try {
        log(`Generating AI content for ${row.name}`);
        const prompt = buildPlaceContentPrompt(row as any, transportInfo);
        const contentLong = await deepSeekChatCompletion(
          'You are an expert SEO content writer for a US place of worship directory.',
          prompt,
          { temperature: 0.7, max_tokens: 2500 }
        );
        log(`AI content generated (${countWords(contentLong)} words)`);

        if (countWords(contentLong) < 1400) {
          log(`Expanding short content`);
          return await expandWithAi(contentLong, row.name);
        }
        return contentLong;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log(`AI content failed: ${message}. Using fallback.`);
        return buildFallbackContent(row as any, transportInfo);
      }
    })();

    const [uploaded, rawContent] = await Promise.all([imagePromise, contentPromise]);
    const contentLong = cleanAiContent(rawContent);

    if (uploaded.length > 0) {
      for (let idx = 0; idx < uploaded.length; idx++) {
        await admin.from('place_images').insert({
          place_id: placeId,
          url: uploaded[idx].url,
          alt_text: uploaded[idx].alt_text || row.name,
          is_primary: idx === 0,
        });
      }
    }

    const { error: updateError } = await admin
      .from('places')
      .update({
        content_long: contentLong,
        transport_info: transportInfo,
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', placeId);

    if (updateError) throw new Error(updateError.message);

    await admin
      .from('job_queue')
      .update({ status: 'completed', error: null, updated_at: new Date().toISOString() })
      .eq('id', job.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const maxAttempts = 3;
    const failed = job.attempts + 1 >= maxAttempts;
    const scheduledFor = failed
      ? new Date().toISOString()
      : new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await admin
      .from('job_queue')
      .update({
        status: failed ? 'failed' : 'pending',
        error: message,
        scheduled_for: scheduledFor,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    console.error(`${label ? label + ' ' : ''}Job ${job.id} failed:`, message);
  }
}
