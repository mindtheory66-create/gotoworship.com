export function cleanAiContent(text: string): string {
  if (!text) return text;

  let cleaned = text.replace(/\r\n/g, '\n').trim();

  // Remove accidental Markdown code fences (e.g. ```markdown ... ```)
  cleaned = cleaned.replace(/^```(?:markdown)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

  // Remove common AI preamble lines that appear at the very beginning.
  const metaStart = /^(Here is|Below is|This article|This guide|This is a|This comprehensive|SEO-optimized|Written to serve|Designed for|Below you will find)/i;
  const lines = cleaned.split('\n');
  while (lines.length > 0 && (metaStart.test(lines[0].trim()) || lines[0].trim() === '')) {
    lines.shift();
  }
  cleaned = lines.join('\n').trim();

  // Drop an unwanted title heading if the content starts with one.
  cleaned = cleaned.replace(/^#\s+.+\n?/m, '').trim();

  // If the content uses Markdown section headings, strip everything before the first ##.
  const firstSection = cleaned.match(/^##\s+/m);
  if (firstSection?.index !== undefined) {
    cleaned = cleaned.slice(firstSection.index).trim();
  }

  // Strip trailing meta-commentary lines (e.g. "Let me know if you need anything else").
  const trailingMeta = /^(Here is|Below is|This article|This guide|This is|Let me know|I hope|If you need|Feel free to reach out|Return only)/i;
  const tlines = cleaned.split('\n');
  while (tlines.length > 0) {
    const last = tlines[tlines.length - 1].trim();
    if (last && last.length < 200 && trailingMeta.test(last)) {
      tlines.pop();
    } else {
      break;
    }
  }

  return tlines.join('\n').trim();
}
