export const GITHUB_USER = "ursche";

export type Repo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
};

/** Shown if the GitHub API is unreachable or rate limited. */
const FALLBACK: Repo[] = [
  {
    id: 1,
    name: "your-project-here",
    description: "Pin your best repos on GitHub and they will appear here automatically.",
    html_url: `https://github.com/${GITHUB_USER}`,
    language: "PHP",
    stargazers_count: 0,
  },
];

/**
 * Fetched on the server so the repos are in the HTML crawlers see.
 * Cached with the page and refreshed hourly (ISR).
 */
export async function getRepos(): Promise<Repo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`,
      { headers: { Accept: "application/vnd.github+json" }, next: { revalidate: 3600 } },
    );
    if (!res.ok) return FALLBACK;
    const data: Repo[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) return FALLBACK;
    return data.map(({ id, name, description, html_url, language, stargazers_count }) => ({
      id,
      name,
      description,
      html_url,
      language,
      stargazers_count,
    }));
  } catch {
    return FALLBACK;
  }
}
