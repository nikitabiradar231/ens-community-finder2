import { IndexedProfile, loadAllENSProfiles } from './ensLoader.js';
import { COMMUNITY_MEMBERS } from '../config/community.js';

class ProfileIndexStore {
  private profiles: Map<string, IndexedProfile> = new Map();
  private lastRefreshedAt: string | null = null;
  private isRefreshing: boolean = false;

  /**
   * Rebuilds the in-memory index by querying ENS text records from Sepolia.
   */
  public async refresh(members: string[] = COMMUNITY_MEMBERS): Promise<IndexedProfile[]> {
    this.isRefreshing = true;
    try {
      const fetchedProfiles = await loadAllENSProfiles(members);
      this.profiles.clear();
      for (const profile of fetchedProfiles) {
        this.profiles.set(profile.ensName, profile);
      }
      this.lastRefreshedAt = new Date().toISOString();
      return Array.from(this.profiles.values());
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Directly sets profiles (useful for testing or pre-populating).
   */
  public setProfiles(profiles: IndexedProfile[]): void {
    this.profiles.clear();
    for (const p of profiles) {
      this.profiles.set(p.ensName, p);
    }
    this.lastRefreshedAt = new Date().toISOString();
  }

  /**
   * Retrieves all indexed profiles.
   */
  public getAll(): IndexedProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Retrieves a specific profile by ENS name.
   */
  public get(ensName: string): IndexedProfile | undefined {
    return this.profiles.get(ensName);
  }

  /**
   * Returns count of indexed profiles.
   */
  public getCount(): number {
    return this.profiles.size;
  }

  /**
   * Returns timestamp of last index refresh.
   */
  public getLastRefreshedAt(): string | null {
    return this.lastRefreshedAt;
  }

  public getIsRefreshing(): boolean {
    return this.isRefreshing;
  }
}

export const profileIndex = new ProfileIndexStore();
