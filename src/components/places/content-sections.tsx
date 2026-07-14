'use client';

import { Card } from '@/components/ui/card';
import { cleanAiContent } from '@/lib/utils/clean-ai-content';

function normalizeDashes(text: string): string {
  return text.replace(/[—–]/g, '-');
}

function stripListMarker(text: string): string {
  // Removes leading bullet markers (-, *, •, etc.) or numbered markers (1., 2., ...)
  return text.replace(/^(\d+\.\s+|[-*•‣◦▪▫]\s*)/, '').trim();
}

interface Section {
  title: string;
  body: string;
}

function parseSections(content: string): Section[] {
  const normalized = content.replace(/\r\n/g, '\n');
  const firstSection = normalized.match(/^##\s+/m);

  if (firstSection?.index == null) {
    const trimmed = normalized.trim();
    return trimmed ? [{ title: '', body: trimmed }] : [];
  }

  const fromFirst = normalized.slice(firstSection.index).trim();
  const parts = fromFirst.split(/\n##\s+/).map((p) => p.trim()).filter(Boolean);

  return parts.map((part) => {
    const firstNewline = part.indexOf('\n');
    const titleLine = firstNewline === -1 ? part : part.slice(0, firstNewline);
    const body = firstNewline === -1 ? '' : part.slice(firstNewline + 1).trim();
    const title = titleLine.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '').trim();
    return { title, body };
  });
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">$1</a>');
}

function Body({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).filter((b) => b.trim());
  const elements: JSX.Element[] = [];
  let key = 0;
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length === 0 || !listType) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(
      <Tag
        key={key++}
        className={`${
          listType === 'ol' ? 'list-decimal' : 'list-disc'
        } space-y-2 pl-5 marker:text-primary-500`}
      >
        {listItems.map((item, idx) => (
          <li
            key={idx}
            dangerouslySetInnerHTML={{
              __html: renderInline(stripListMarker(item)),
            }}
          />
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim());
    if (lines.length === 0) continue;

    // Heading 3
    if (lines.length === 1 && lines[0].startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={key++} className="mt-6 text-lg font-bold text-slate-900">
          {lines[0].replace('### ', '').trim()}
        </h3>
      );
      continue;
    }

    // Heading 4
    if (lines.length === 1 && lines[0].startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={key++} className="mt-5 text-base font-bold text-slate-800">
          {lines[0].replace('#### ', '').trim()}
        </h4>
      );
      continue;
    }

    const isUl = lines.every((l) => l.startsWith('- ') || l.startsWith('* '));
    const isOl = lines.every((l) => /^\d+\.\s/.test(l));

    if (isUl || isOl) {
      if (listType && listType !== (isOl ? 'ol' : 'ul')) flushList();
      listType = isOl ? 'ol' : 'ul';
      listItems.push(...lines);
      continue;
    }

    flushList();

    // Mixed block
    if (
      lines.some(
        (l) =>
          l.startsWith('- ') ||
          l.startsWith('* ') ||
          /^\d+\.\s/.test(l) ||
          l.startsWith('### ') ||
          l.startsWith('#### ')
      )
    ) {
      for (const line of lines) {
        if (line.startsWith('### ')) {
          elements.push(
            <h3 key={key++} className="mt-6 text-lg font-bold text-slate-900">
              {line.replace('### ', '').trim()}
            </h3>
          );
        } else if (line.startsWith('#### ')) {
          elements.push(
            <h4 key={key++} className="mt-5 text-base font-bold text-slate-800">
              {line.replace('#### ', '').trim()}
            </h4>
          );
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          elements.push(
            <div key={key++} className="flex gap-3">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
              <span
                className="text-slate-600"
                dangerouslySetInnerHTML={{
                  __html: renderInline(stripListMarker(line)),
                }}
              />
            </div>
          );
        } else if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^\d+/)?.[0] || '';
          elements.push(
            <div key={key++} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {num}
              </span>
              <span
                className="text-slate-600"
                dangerouslySetInnerHTML={{
                  __html: renderInline(line.replace(/^\d+\.\s*/, '').trim()),
                }}
              />
            </div>
          );
        } else {
          elements.push(
            <p key={key++} className="leading-7 text-slate-600" dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
          );
        }
      }
    } else {
      const paragraph = lines.join(' ').trim();
      elements.push(
        <p key={key++} className="leading-7 text-slate-600" dangerouslySetInnerHTML={{ __html: renderInline(paragraph) }} />
      );
    }
  }

  flushList();
  return <div className="space-y-5">{elements}</div>;
}

export function ContentSections({ content }: { content: string | null }) {
  if (!content) return null;

  const cleaned = normalizeDashes(cleanAiContent(content));
  const sections = parseSections(cleaned);

  if (sections.length === 0) {
    return (
      <Card className="p-6 md:p-8">
        <p className="text-slate-600">Detailed content is being generated.</p>
      </Card>
    );
  }

  if (sections.length === 1 && !sections[0].title) {
    return (
      <Card className="border border-slate-200 p-6 shadow-sm md:p-8">
        <Body body={sections[0].body} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => (
        <Card key={idx} className="border border-slate-200 p-6 shadow-sm md:p-8">
          <h2 className="mb-5 text-xl font-bold text-slate-900 md:text-2xl">{section.title}</h2>
          <Body body={section.body} />
        </Card>
      ))}
    </div>
  );
}
