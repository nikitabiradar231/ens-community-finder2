import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { COMMUNITY_MEMBERS, ENS_RECORD_KEYS, SEPOLIA_DEFAULT_TEXT_RECORDS } from '../config/community.js';

export interface IndexedProfile {
  ensName: string;
  bio: string;
  skills: string[];
  availability: string;
  mentoring: string;
  location: string;
  rawText: string;
  fetchedAt: string;
}

// Instantiate public viem client for Sepolia
const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.ankr.com/eth_sepolia';
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl, { timeout: 10_000 }),
});

/**
 * Loads profile text records for a given ENS name live from Sepolia.
 */
export async function loadENSProfile(
  ensName: string,
  client = publicClient
): Promise<IndexedProfile> {
  const records: Record<string, string> = {};

  // Fetch ENS text records in parallel with error handling
  await Promise.all(
    ENS_RECORD_KEYS.map(async (key) => {
      try {
        const text = await client.getEnsText({
          name: ensName,
          key,
        });
        if (text) {
          records[key] = text;
        }
      } catch (err) {
        // Logging debug error if RPC lookup fails for key
      }
    })
  );

  // Merge with default fallback records for test subnames if on-chain records are missing
  const defaultRecords = SEPOLIA_DEFAULT_TEXT_RECORDS[ensName] || {};
  const getRecord = (primaryKey: string, fallbackKey?: string): string => {
    return (
      records[primaryKey] ||
      (fallbackKey ? records[fallbackKey] : '') ||
      defaultRecords[primaryKey] ||
      (fallbackKey ? defaultRecords[fallbackKey] : '') ||
      ''
    );
  };

  const bio = getRecord('profile.bio', 'bio');
  const skillsRaw = getRecord('profile.skills', 'skills');
  const availability = getRecord('profile.availability', 'availability');
  const mentoring = getRecord('profile.mentoring', 'notice');
  const location = getRecord('profile.location');

  const skills = skillsRaw
    ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const rawText = `ENS Name: ${ensName}\nBio: ${bio}\nSkills: ${skills.join(', ')}\nAvailability: ${availability}\nMentoring: ${mentoring}\nLocation: ${location}`;

  return {
    ensName,
    bio,
    skills,
    availability,
    mentoring,
    location,
    rawText,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Loads all community member profiles live from Sepolia ENS text records.
 */
export async function loadAllENSProfiles(
  members: string[] = COMMUNITY_MEMBERS,
  client = publicClient
): Promise<IndexedProfile[]> {
  const profiles = await Promise.all(
    members.map((name) => loadENSProfile(name, client))
  );
  return profiles;
}
