import { describe, it, expect, vi } from 'vitest';
import { loadENSProfile, IndexedProfile } from '../src/server/services/ensLoader.js';

describe('ENS Profile Loader & Indexer (Mocked Viem Client)', () => {
  it('loads profile fields from ENS text records via viem client', async () => {
    // Create mocked viem public client
    const mockViemClient = {
      getEnsText: vi.fn().mockImplementation(async ({ name, key }: { name: string; key: string }) => {
        if (key === 'profile.bio') return 'Mocked ENS Bio for ' + name;
        if (key === 'profile.skills') return 'Solidity, Foundry, EVM';
        if (key === 'profile.availability') return 'Available weekdays';
        if (key === 'profile.mentoring') return 'EVM security audits';
        if (key === 'profile.location') return 'London, UK';
        return null;
      }),
    } as any;

    const profile: IndexedProfile = await loadENSProfile('charlie.community.eth', mockViemClient);

    expect(mockViemClient.getEnsText).toHaveBeenCalled();
    expect(profile.ensName).toBe('charlie.community.eth');
    expect(profile.bio).toBe('Mocked ENS Bio for charlie.community.eth');
    expect(profile.skills).toEqual(['Solidity', 'Foundry', 'EVM']);
    expect(profile.availability).toBe('Available weekdays');
    expect(profile.mentoring).toBe('EVM security audits');
    expect(profile.location).toBe('London, UK');
  });
});
