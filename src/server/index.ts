import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { profileIndex } from './services/profileIndex.js';
import { retrieveCandidates, TOP_K } from './services/retriever.js';
import { generateLLMAnswer } from './services/llmGenerator.js';
import { validateCandidates } from './services/candidateGuard.js';
import { COMMUNITY_MEMBERS } from './config/community.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize index on startup if empty
async function ensureIndexInitialized() {
  if (profileIndex.getCount() === 0) {
    console.log('[INDEX] Initializing community index from Sepolia ENS text records...');
    await profileIndex.refresh(COMMUNITY_MEMBERS);
    console.log(`[INDEX] Index initialized with ${profileIndex.getCount()} profiles.`);
  }
}

// Health endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    topKLimit: TOP_K,
    indexedMembersCount: profileIndex.getCount(),
  });
});

// Get community details
app.get('/api/community', async (req: Request, res: Response) => {
  await ensureIndexInitialized();
  res.json({
    count: profileIndex.getCount(),
    members: COMMUNITY_MEMBERS,
    lastRefreshedAt: profileIndex.getLastRefreshedAt(),
    profiles: profileIndex.getAll(),
  });
});

// Refresh community index from Sepolia ENS text records
app.post('/api/index/refresh', async (req: Request, res: Response) => {
  try {
    console.log('[INDEX REFRESH] Triggered refresh from Sepolia ENS text records.');
    const updatedProfiles = await profileIndex.refresh(COMMUNITY_MEMBERS);
    res.json({
      success: true,
      count: updatedProfiles.length,
      lastRefreshedAt: profileIndex.getLastRefreshedAt(),
      profiles: updatedProfiles,
    });
  } catch (err: any) {
    console.error('[INDEX REFRESH ERROR]', err);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh ENS community index from Sepolia.',
    });
  }
});

// Search API
app.post('/api/search', async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({
      error: 'Query parameter is required.',
    });
  }

  await ensureIndexInitialized();

  const allProfiles = profileIndex.getAll();

  // 1. Retrieve top-K bounded candidates
  const retrievedCandidates = retrieveCandidates(query, allProfiles, TOP_K);

  // 2. Explicit No-Match check if retrieval produces 0 candidates
  if (retrievedCandidates.length === 0) {
    return res.json({
      query,
      matches: [],
      noMatch: true,
      message: 'Nobody in the current community matches your request.',
    });
  }

  // 3. Send retrieved candidates to LLM
  const modelCandidates = await generateLLMAnswer(query, retrievedCandidates);

  // 4. Candidate Guard validation
  const validatedMatches = validateCandidates(modelCandidates, retrievedCandidates);

  // 5. Explicit No-Match check if no candidate survives validation
  if (validatedMatches.length === 0) {
    return res.json({
      query,
      matches: [],
      noMatch: true,
      message: 'Nobody in the current community matches your request.',
    });
  }

  // 6. Return verified matching results
  return res.json({
    query,
    matches: validatedMatches,
    noMatch: false,
  });
});

// Serve frontend in production if dist exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../dist/client');

app.use(express.static(distPath));
app.get('*', (req: Request, res: Response) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).send('Not Found');
      }
    });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await ensureIndexInitialized();
});

export default app;
