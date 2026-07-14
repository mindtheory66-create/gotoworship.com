interface MarkdownProps {
  content: string;
}

function stripListMarker(text: string): string {
  return text.replace(/^(\d+\.\s+|[-*•‣◦▪▫]\s*)/, '').trim();
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

export function MarkdownRenderer({ content }: MarkdownProps) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let key = 0;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={key++} className="list-disc space-y-1 pl-5">
        {listItems.map((item, idx) => (
          <li key={idx} dangerouslySetInnerHTML={{ __html: renderInline(stripListMarker(item)) }} />
        ))}
      </ul>
    );
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={key++} className="mt-4 text-lg font-bold text-slate-900">{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={key++} className="mt-5 text-xl font-bold text-slate-900">{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={key++} className="text-2xl font-bold text-slate-900">{line.replace('# ', '')}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(line);
    } else {
      flushList();
      elements.push(<p key={key++} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: renderInline(line) }} />);
    }
  }

  flushList();

  return <div className="prose max-w-none space-y-3 text-slate-600">{elements}</div>;
}
