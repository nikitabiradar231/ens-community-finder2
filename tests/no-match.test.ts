import { describe, it, expect } from 'vitest';
import { retrieveCandidates } from '../src/server/services/retriever.js';
import { validateCandidates } from '../src/server/services/candidateGuard.js';
import { IndexedProfile } from '../src/server/services/ensLoader.js';

describe('No-Match Handling', () => {
  const sampleProfiles: IndexedProfile[] = [
    {
      ensName: 'alice.community.eth',
      bio: 'Rust engineer',
      skills: ['Rust'],
      availability: 'Available',
      mentoring: 'Rust mentorship',
      location: 'Berlin',
      rawText: '...',
      fetchedAt: new Date().toISOString(),
    },
  ];

  it('returns an empty array when query has no matching skills or profile keywords', () => {
    const candidates = retrieveCandidates(
      'Who can help me with quantum mechanics astrophysics?',
      sampleProfiles
    );
    expect(candidates).toEqual([]);
  });

  it('returns empty validated results when candidate guard rejects all returned model candidates', () => {
    const modelOutput = [
      {
        ensName: 'nonexistent-person.eth',
        reason: 'Fake match',
      },
    ];

    const validated = validateCandidates(modelOutput, sampleProfiles);
    expect(validated).toEqual([]);
  });
});
