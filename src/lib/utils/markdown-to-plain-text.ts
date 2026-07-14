export function markdownToPlainText(md: string): string {
  if (!md) return '';

  let text = md.replace(/\r\n/g, '\n').replace(/[—–]/g, '-');

  // Remove fenced code blocks entirely
  text = text.replace(/^```(?:\w+)?\s*\n[\s\S]*?\n```\s*$/gm, '');

  // Remove horizontal rules
  text = text.replace(/^\s*[-*_]{3,}\s*$/gm, '');

  // Headings -> plain text
  text = text.replace(/^#+\s*(.*)$/gm, '$1');

  // Bold / italic / underline markers
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/__(.+?)__/g, '$1');
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');

  // Inline code
  text = text.replace(/`([^`]+)`/g, '$1');

  // Links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // List markers
  text = text.replace(/^[-*+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  // Blockquotes
  text = text.replace(/^>\s*/gm, '');

  // Collapse multiple spaces
  text = text.replace(/[ \t]+/g, ' ');

  return text.trim();
}

export function markdownToParagraphs(md: string): string[] {
  const text = markdownToPlainText(md);
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean);
}
