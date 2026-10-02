import { IndexedProfile } from './ensLoader.js';

export interface ModelMatchResult {
  ensName: string;
  reason: string;
  skills?: string[];
  availability?: string;
}

export interface ValidatedMatchResult {
  ensName: string;
  reason: string;
  skills: string[];
  availability: string;
  location?: string;
  bio?: string;
}

/**
 * Candidate Guard: Validates every candidate returned by the LLM.
 * Strictly guarantees that modelCandidate ENS name MUST belong to retrievedCandidate set.
 * Removes/rejects any hallucinated or unretrieved person.
 */
export function validateCandidates(
  modelCandidates: ModelMatchResult[],
  retrievedCandidates: IndexedProfile[]
): ValidatedMatchResult[] {
  const validEnsNames = new Set(
    retrievedCandidates.map((p) => p.ensName.toLowerCase())
  );
  const profileMap = new Map(
    retrievedCandidates.map((p) => [p.ensName.toLowerCase(), p])
  );

  const validated: ValidatedMatchResult[] = [];

  for (const candidate of modelCandidates) {
    const candidateNameLower = candidate.ensName.trim().toLowerCase();

    if (!validEnsNames.has(candidateNameLower)) {
      console.warn(
        `[CANDIDATE GUARD REJECTED] Hallucinated/unretrieved candidate rejected: "${candidate.ensName}"`
      );
      continue;
    }

    const profile = profileMap.get(candidateNameLower)!;

    validated.push({
      ensName: profile.ensName, // preserve original casing
      reason: candidate.reason || 'Matched query requirements.',
      skills: candidate.skills && candidate.skills.length > 0 ? candidate.skills : profile.skills,
      availability: candidate.availability || profile.availability || 'Not specified',
      location: profile.location,
      bio: profile.bio,
    });
  }

  return validated;
}
