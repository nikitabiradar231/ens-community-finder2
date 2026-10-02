import { IndexedProfile } from './ensLoader.js';

export const TOP_K = 5;

export interface ScoredProfile {
  profile: IndexedProfile;
  score: number;
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
  'by', 'about', 'against', 'between', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
  'who', 'what', 'where', 'when', 'why', 'how', 'can', 'could', 'would', 'should',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
  'does', 'did', 'me', 'my', 'myself', 'we', 'our', 'you', 'your', 'he', 'him',
  'she', 'her', 'it', 'its', 'they', 'them', 'this', 'that', 'these', 'those', 'help'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Bounded Retriever: Ranks candidates based on natural-language query relevance.
 * Returns AT MOST TOP_K profiles. Never returns the full index.
 */
export function retrieveCandidates(
  query: string,
  profiles: IndexedProfile[],
  topK: number = TOP_K
): IndexedProfile[] {
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0 || profiles.length === 0) {
    return [];
  }

  const scored: ScoredProfile[] = profiles.map((p) => {
    let score = 0;

    const bioTokens = tokenize(p.bio);
    const skillsTokens = tokenize(p.skills.join(' '));
    const availTokens = tokenize(p.availability);
    const mentorTokens = tokenize(p.mentoring);
    const locationTokens = tokenize(p.location);

    for (const qToken of queryTokens) {
      // Direct skills match (highest priority)
      if (p.skills.some((s) => s.toLowerCase().includes(qToken))) {
        score += 5.0;
      }
      if (skillsTokens.includes(qToken)) {
        score += 4.0;
      }

      // Mentoring & Bio match
      if (mentorTokens.includes(qToken)) {
        score += 3.0;
      }
      if (bioTokens.includes(qToken)) {
        score += 2.0;
      }

      // Availability match (e.g. "month", "weekend", "available", "free")
      if (availTokens.includes(qToken)) {
        score += 2.5;
      }

      // Location match
      if (locationTokens.includes(qToken)) {
        score += 1.5;
      }
    }

    // Exact skill phrase matching
    const queryLower = query.toLowerCase();
    for (const skill of p.skills) {
      if (queryLower.includes(skill.toLowerCase())) {
        score += 6.0;
      }
    }

    return { profile: p, score };
  });

  // Filter candidates with a positive relevance score and sort descending
  const relevant = scored
    .filter((sp) => sp.score > 0)
    .sort((a, b) => b.score - a.score);

  // Return at most TOP_K candidates
  return relevant.slice(0, topK).map((sp) => sp.profile);
}
