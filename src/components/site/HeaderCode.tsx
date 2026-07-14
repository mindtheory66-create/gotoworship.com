import { ReactNode } from 'react';

const TAG_REGEX = /<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>([\s\S]*?)<\/\1>|<([a-zA-Z][a-zA-Z0-9]*)([^>]*)\/>/g;
const ATTR_REGEX = /([a-zA-Z0-9\-:]+)(?:=(?:"([^"]*)"|'([^']*)'|([^ \t\n\r]*)))?/g;

const ATTR_NAME_MAP: Record<string, string> = {
  crossorigin: 'crossOrigin',
  charset: 'charSet',
  'http-equiv': 'httpEquiv',
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  playsinline: 'playsInline',
  srcset: 'srcSet',
  itemprop: 'itemProp',
  itemscope: 'itemScope',
  itemtype: 'itemType',
};

function mapAttrName(name: string): string {
  return ATTR_NAME_MAP[name.toLowerCase()] || name;
}

function parseAttrString(attrString: string): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};
  let match: RegExpExecArray | null;

  ATTR_REGEX.lastIndex = 0;
  while ((match = ATTR_REGEX.exec(attrString)) !== null) {
    const rawName = match[1];
    const value = match[2] !== undefined
      ? match[2]
      : match[3] !== undefined
      ? match[3]
      : match[4];

    const name = mapAttrName(rawName);
    attrs[name] = value === undefined ? true : value;
  }

  return attrs;
}

function renderScript(
  attrs: Record<string, string | boolean>,
  content: string,
  key: string
): ReactNode {
  const scriptAttrs: Record<string, string | boolean | undefined> = {};
  for (const [k, v] of Object.entries(attrs)) {
    scriptAttrs[k] = v;
  }

  if (attrs.src) {
    return <script key={key} {...scriptAttrs} />;
  }

  return (
    <script
      key={key}
      {...scriptAttrs}
      dangerouslySetInnerHTML={{ __html: content.trim() }}
    />
  );
}

export function HeaderCode({ code }: { code: string }): ReactNode {
  if (!code || !code.trim()) return null;

  const elements: ReactNode[] = [];
  let match: RegExpExecArray | null;
  let index = 0;

  TAG_REGEX.lastIndex = 0;
  while ((match = TAG_REGEX.exec(code)) !== null) {
    const tag = (match[1] || match[4]).toLowerCase();
    const attrString = match[2] || match[5] || '';
    const content = match[3] || '';
    const attrs = parseAttrString(attrString);
    const key = `head-code-${index++}`;

    switch (tag) {
      case 'script':
        elements.push(renderScript(attrs, content, key));
        break;
      case 'style':
        elements.push(
          <style
            key={key}
            {...attrs}
            dangerouslySetInnerHTML={{ __html: content.trim() }}
          />
        );
        break;
      case 'noscript':
        elements.push(
          <noscript
            key={key}
            dangerouslySetInnerHTML={{ __html: content.trim() }}
          />
        );
        break;
      case 'meta':
        elements.push(<meta key={key} {...attrs} />);
        break;
      case 'link':
        elements.push(<link key={key} {...attrs} />);
        break;
      default:
        // Skip unsupported tags
        break;
    }
  }

  return <>{elements}</>;
}
