import type { JSONContent } from "@tiptap/core";

const WORDS_PER_MINUTE = 225;

function collectText(node: JSONContent, out: string[]) {
  if (node.text) out.push(node.text);
  node.content?.forEach((child) => collectText(child, out));
  if (node.type === "paragraph" || node.type === "heading") out.push(" ");
}

export function plainText(doc: JSONContent) {
  const parts: string[] = [];
  collectText(doc, parts);
  return parts.join("").replace(/\s+/g, " ").trim();
}

export function readingMinutes(text: string) {
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function excerptOf(text: string, max = 180) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isDoc(value: unknown): value is JSONContent {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as JSONContent).type === "doc"
  );
}

export function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
