export interface MatchResult {
  ensName: string;
  reason: string;
  skills: string[];
  availability: string;
  location?: string;
  bio?: string;
}

export interface SearchResponse {
  query: string;
  matches: MatchResult[];
  noMatch: boolean;
  message?: string;
}

export interface CommunityResponse {
  count: number;
  members: string[];
  lastRefreshedAt: string | null;
  profiles: Array<{
    ensName: string;
    bio: string;
    skills: string[];
    availability: string;
    mentoring: string;
    location: string;
  }>;
}

export async function fetchCommunity(): Promise<CommunityResponse> {
  const res = await fetch('/api/community');
  if (!res.ok) throw new Error('Failed to fetch community');
  return res.json();
}

export async function refreshIndex(): Promise<CommunityResponse> {
  const res = await fetch('/api/index/refresh', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to refresh ENS index');
  return res.json();
}

export async function searchHelpers(query: string): Promise<SearchResponse> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Search request failed');
  return res.json();
}
