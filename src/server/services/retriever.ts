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

const META_WORDS = new Set([
  'mentor', 'mentoring', 'mentors', 'helper', 'helpers', 'free',
  'available', 'availability', 'month', 'week', 'weekend', 'year', 'day',
  'time', 'session', 'sessions', 'call', 'calls', 'review', 'reviews', 'query',
  'queries', 'expert', 'specialist', 'developer', 'engineer', 'lead', 'dev', 'devs'
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

  // Separate query tokens into domain topic tokens vs meta modifier tokens
  const topicTokens = queryTokens.filter((t) => !META_WORDS.has(t));
  const metaTokens = queryTokens.filter((t) => META_WORDS.has(t));

  const scored: ScoredProfile[] = profiles.map((p) => {
    let topicScore = 0;
    let metaScore = 0;

    const bioTokens = tokenize(p.bio);
    const skillsTokens = tokenize(p.skills.join(' '));
    const availTokens = tokenize(p.availability);
    const mentorTokens = tokenize(p.mentoring);
    const locationTokens = tokenize(p.location);

    // 1. Evaluate domain topic tokens
    for (const tToken of topicTokens) {
      if (p.skills.some((s) => s.toLowerCase().includes(tToken))) {
        topicScore += 6.0;
      }
      if (skillsTokens.includes(tToken)) {
        topicScore += 5.0;
      }
      if (bioTokens.includes(tToken)) {
        topicScore += 3.0;
      }
      if (mentorTokens.includes(tToken)) {
        topicScore += 2.5;
      }
      if (locationTokens.includes(tToken)) {
        topicScore += 1.5;
      }
    }

    // Exact skill phrase matching
    const queryLower = query.toLowerCase();
    for (const skill of p.skills) {
      if (queryLower.includes(skill.toLowerCase())) {
        topicScore += 7.0;
      }
    }

    // 2. Evaluate meta modifier tokens (availability/mentoring boosts)
    for (const mToken of metaTokens) {
      if (availTokens.includes(mToken)) {
        metaScore += 2.0;
      }
      if (mentorTokens.includes(mToken)) {
        metaScore += 1.5;
      }
    }

    // CRITICAL RELEVANCE RULE: If topic tokens exist in query, candidate MUST match at least one topic token
    if (topicTokens.length > 0 && topicScore === 0) {
      return { profile: p, score: 0 };
    }

    const totalScore = topicScore + metaScore;
    return { profile: p, score: totalScore };
  });

  // Filter candidates with a positive relevance score and sort descending
  const relevant = scored
    .filter((sp) => sp.score > 0)
    .sort((a, b) => b.score - a.score);

  // Return at most TOP_K candidates
  return relevant.slice(0, topK).map((sp) => sp.profile);
}
