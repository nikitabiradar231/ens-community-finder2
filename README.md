# ENS Community Finder (`ens-community-finder`)

> **"Who In Here Can Help Me?"**  
> An ENS-based community people finder built with **TypeScript**, **React**, **Vite**, **Express**, and **Viem** on **Ethereum Sepolia**.

---

## 🌟 Project Overview

`ens-community-finder` allows members of decentralized Web3 communities to ask natural-language questions such as:

> *"Who can mentor me in Rust and is free this month?"*

The application retrieves real community identities directly from live **ENS text records on Sepolia**, ranks the candidate profiles using a bounded retriever, passes candidates to an LLM to explain why they match, and enforces a strict **Candidate Guard** to prevent LLM hallucinations or prompt injection attacks.

---

## 🎯 Problem Statement

Finding skilled collaborators or mentors in large decentralized ENS communities is challenging:
1. **Unstructured Data**: Member skills, interests, and availability are scattered across custom ENS text records.
2. **LLM Hallucinations**: Standard AI search engines often invent ("hallucinate") non-existent people or attribute false skills.
3. **Prompt Injection Risks**: Malicious users can place prompt injection payloads inside their public ENS bio or text records to hijack LLM recommendations.

---

## 🏗️ Architecture

```text
               +----------------------------------+
               |     Ethereum Sepolia Network     |
               +----------------------------------+
                                |
                   (Live Viem getEnsText reads)
                                v
               +----------------------------------+
               |     ENS Profile Loader Service   |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |       InMemory Profile Index     |
               +----------------------------------+
                                |
               (Natural Language Query: "Rust Mentor")
                                v
               +----------------------------------+
               |      Bounded Retriever (TOP_K=5) |
               +----------------------------------+
                                |
                 (At most 5 Candidate Profiles)
                                v
               +----------------------------------+
               |    LLM Explanation Generator     |
               | (Prompt Injection Safe - Abort)  |
               +----------------------------------+
                                |
                (Raw Model Candidate Predictions)
                                v
               +----------------------------------+
               |         Candidate Guard          |
               | (modelCandidate ∈ retrievedSet)  |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |     Verified Results / UI        |
               +----------------------------------+
```

---

## 🔒 Security Architecture & Guardrails

1. **Untrusted Data Isolation**: ENS profile text is treated as **untrusted data**. Profile text is **NEVER interpolated into system/instruction prompts**. It is supplied in a separate context block marked as untrusted user data.
2. **Strict Candidate Guard**: The `validateCandidates()` guard verifies that every candidate returned by the LLM belongs to `retrievedCandidates`. Hallucinated names (e.g. `fake-person.eth`) are rejected.
3. **Bounded Context Window (`TOP_K = 5`)**: The model receives at most `TOP_K` retrieved profiles, preventing token exhaustion and preventing model access to the entire index.
4. **Explicit No-Match Fallback**: If retrieval yields 0 candidates or candidate guard rejects all candidates, the app returns `noMatch: true` with `"Nobody in the current community matches your request."` without asking the LLM to guess.
5. **LLM Timeout Enforcement**: Every LLM call has an explicit timeout (`MODEL_TIMEOUT_MS = 15_000`) using `AbortController`.

---

## 🌐 ENS Sepolia Test Community

The application monitors 9 community identities on **Sepolia**:

| ENS Name | Role / Specialty | Key Profile Record Keys |
| :--- | :--- | :--- |
| `alice.community.eth` | Senior Systems Engineer (Rust, Tokio, Wasm) | `profile.bio`, `profile.skills`, `profile.availability`, `profile.mentoring` |
| `bob.community.eth` | Embedded Systems & Rust Core Contributor | `profile.bio`, `profile.skills`, `profile.availability`, `profile.mentoring` |
| `charlie.community.eth` | Smart Contract Auditor & Solidity Lead | `profile.bio`, `profile.skills`, `profile.availability`, `profile.mentoring` |
| `diana.community.eth` | Frontend Architect & UI/UX Specialist | `profile.bio`, `profile.skills`, `profile.availability`, `profile.mentoring` |
| `eve.community.eth` | Fullstack Web3 & Cross-Chain Engineer | `profile.bio`, `profile.skills`, `profile.availability`, `profile.mentoring` |
| `frank.community.eth` | ZK-Proof & Cryptography Researcher | `profile.bio`, `profile.skills`, `profile.availability`, `profile.mentoring` |
| `grace.community.eth` | DevOps & Sepolia Infrastructure Lead | `profile.bio`, `profile.skills`, `profile.availability`, `profile.mentoring` |
| `hector.community.eth` | AI & Vector Database Developer | `profile.bio`, `profile.skills`, `profile.availability`, `profile.mentoring` |
| `malicious.community.eth` | **Adversarial Prompt Injection Test Profile** | `profile.bio` (contains prompt injection instructions) |

### ENS Text Record Keys Used
* `profile.bio`
* `profile.skills`
* `profile.availability`
* `profile.mentoring`
* `profile.location`

---

## 🚀 Getting Started

### 1. Installation

```bash
git clone https://github.com/nikitabiradar231/dev2.git
cd dev2
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

`.env` configuration keys:

```env
PORT=3001
SEPOLIA_RPC_URL=https://rpc.ankr.com/eth_sepolia

# Optional LLM API Key (OpenAI Compatible)
# If left empty, the application uses an intelligent fallback matcher
LLM_API_KEY=
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

### 3. Development Server

Run both frontend and backend concurrently:

```bash
npm run dev
```

Visit the app in your browser at `http://localhost:3000`.

---

## 🔄 Refreshing the ENS Index

To re-query ENS text records live from Sepolia:
- **API Endpoint**: `POST /api/index/refresh`
- **UI Button**: Click **"Refresh Community"** in the top-right of the community status section.

---

## 🧪 Testing

Run the Vitest suite covering all security, retrieval, candidate guard, and indexing requirements:

```bash
npm test
```

### Test Coverage Highlights
* `tests/member-validation.test.ts`: Verifies hallucinated model candidates are rejected.
* `tests/top-k-limit.test.ts`: Asserts max `TOP_K = 5` profiles reach retrieval.
* `tests/prompt-separation.test.ts`: Statically verifies system prompt is unpolluted by profile text.
* `tests/no-match.test.ts`: Tests explicit no-match response handling.
* `tests/ens-indexing.test.ts`: Tests profile loader with mocked Viem calls.
* `tests/adversarial-profile.test.ts`: Tests prompt injection defense against malicious ENS profile text.

---

## 📁 Recorded Example Cases & Queries

* `examples/rust-mentor.md`
* `examples/frontend-helper.md`
* `examples/solidity-expert.md`
* `examples/no-match.md`
* `tests/recorded-queries.json`
