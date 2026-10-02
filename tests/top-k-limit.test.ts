import { describe, it, expect } from 'vitest';
import { retrieveCandidates, TOP_K } from '../src/server/services/retriever.js';
import { IndexedProfile } from '../src/server/services/ensLoader.js';

describe('Top-K Bounded Retrieval', () => {
  it('strictly limits returned candidates to TOP_K constant', () => {
    expect(TOP_K).toBe(5);

    // Create 10 matching dummy profiles
    const dummyProfiles: IndexedProfile[] = Array.from({ length: 10 }).map((_, i) => ({
      ensName: `member${i}.community.eth`,
      bio: 'Developer building web3 apps in Rust and TypeScript',
      skills: ['Rust', 'TypeScript'],
      availability: 'Available this month',
      mentoring: 'Mentoring devs',
      location: 'Global',
      rawText: '...',
      fetchedAt: new Date().toISOString(),
    }));

    const results = retrieveCandidates('Who can mentor me in Rust and TypeScript?', dummyProfiles, TOP_K);

    expect(results.length).toBeLessThanOrEqual(TOP_K);
    expect(results.length).toBe(5);
  });
});
