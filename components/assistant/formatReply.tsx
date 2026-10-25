import type { ReactNode } from "react";

// The model replies in plain text or light Markdown. This turns **bold**,
// `code`, [links](https://...), bare URLs, emails and "- " lists into React
// nodes, without ever injecting HTML.

const INLINE =
  /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\)|https?:\/\/[^\s<>()]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

const LINK_CLASS = "text-laser underline underline-offset-2 hover:text-white";

function safeHref(href: string): string | null {
  if (/^mailto:/i.test(href)) return href;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function link(href: string, label: string, key: string): ReactNode {
  const safe = safeHref(href);
  if (!safe) return label;
  const external = !safe.startsWith("mailto:");
  return (
    <a
      key={key}
      href={safe}
      className={LINK_CLASS}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {label}
    </a>
  );
}

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;

  for (const match of Array.from(text.matchAll(INLINE))) {
    const start = match.index ?? 0;
    let token = match[0];
    let trailing = "";

    if (start > last) out.push(text.slice(last, start));
    const key = `${keyBase}-${i++}`;

    if (token.startsWith("**")) {
      out.push(<strong key={key} className="font-semibold text-white">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      out.push(
        <code key={key} className="rounded bg-white/10 px-1 py-0.5 text-[0.85em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/) ?? [];
      out.push(link(href ?? "", label ?? token, key));
    } else if (/^https?:/i.test(token)) {
      // Keep sentence punctuation out of the link.
      const stripped = token.replace(/[.,!?;:]+$/, "");
      trailing = token.slice(stripped.length);
      token = stripped;
      out.push(link(token, token.replace(/^https?:\/\//, ""), key));
    } else {
      out.push(link(`mailto:${token}`, token, key));
    }

    if (trailing) out.push(trailing);
    last = start + match[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function formatReply(text: string): ReactNode {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (!para.length) return;
    const k = `p${blocks.length}`;
    blocks.push(<p key={k}>{inline(para.join(" "), k)}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const k = `l${blocks.length}`;
    const items = list.items.map((item, idx) => <li key={idx}>{inline(item, `${k}-${idx}`)}</li>);
    blocks.push(
      list.ordered ? (
        <ol key={k} className="list-decimal space-y-1 pl-5">{items}</ol>
      ) : (
        <ul key={k} className="list-disc space-y-1 pl-5 marker:text-neon">{items}</ul>
      ),
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);

    if (bullet || numbered) {
      flushPara();
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else if (!line) {
      flushPara();
      flushList();
    } else {
      flushList();
      // The prompt asks for no headings; if one slips through, show it as plain text.
      para.push(line.replace(/^#{1,6}\s+/, ""));
    }
  }
  flushPara();
  flushList();

  return <div className="space-y-2">{blocks}</div>;
}
