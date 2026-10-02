import { describe, it, expect, vi } from 'vitest';
import { validateCandidates } from '../src/server/services/candidateGuard.js';
import { IndexedProfile } from '../src/server/services/ensLoader.js';

describe('Candidate Guard Membership Validation', () => {
  const retrievedCandidates: IndexedProfile[] = [
    {
      ensName: 'alice.community.eth',
      bio: 'Rust developer',
      skills: ['Rust', 'Wasm'],
      availability: 'Available this month',
      mentoring: 'Mentoring in Rust',
      location: 'Berlin',
      rawText: '...',
      fetchedAt: new Date().toISOString(),
    },
    {
      ensName: 'bob.community.eth',
      bio: 'Systems engineer',
      skills: ['Rust', 'C++'],
      availability: 'Weekends',
      mentoring: 'Mentoring C++ devs',
      location: 'SF',
      rawText: '...',
      fetchedAt: new Date().toISOString(),
    },
  ];

  it('accepts valid candidates present in the retrieved candidate set', () => {
    const modelCandidates = [
      {
        ensName: 'alice.community.eth',
        reason: 'Alice is a skilled Rust developer available this month.',
        skills: ['Rust'],
        availability: 'Available this month',
      },
    ];

    const result = validateCandidates(modelCandidates, retrievedCandidates);
    expect(result).toHaveLength(1);
    expect(result[0].ensName).toBe('alice.community.eth');
  });

  it('rejects hallucinated candidates not present in the retrieved set', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const modelCandidates = [
      {
        ensName: 'alice.community.eth',
        reason: 'Alice is a skilled Rust developer.',
      },
      {
        ensName: 'fake-person.eth', // Hallucinated identity
        reason: 'Fake person claiming to be a Rust master.',
      },
      {
        ensName: 'hacker.community.eth', // Unretrieved identity
        reason: 'Unretrieved identity.',
      },
    ];

    const result = validateCandidates(modelCandidates, retrievedCandidates);

    expect(result).toHaveLength(1);
    expect(result[0].ensName).toBe('alice.community.eth');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[CANDIDATE GUARD REJECTED]')
    );

    consoleSpy.mockRestore();
  });
});
