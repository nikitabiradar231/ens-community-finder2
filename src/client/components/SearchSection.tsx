import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const PRESET_PROMPTS = [
  'Who can mentor me in Rust and is free this month?',
  'Who knows Solidity and can help with smart contract audits?',
  'Who can help me build React frontends for Web3?',
  'Who works on ZK-Proofs and cryptography in Rust?',
  'Who knows DevOps and Kubernetes for Sepolia deployment?',
  'Who can help me with quantum computing?' // No match example
];

export const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handlePillClick = (prompt: string) => {
    setQuery(prompt);
    onSearch(prompt);
  };

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h1 className="hero-title">Who In Here Can Help Me?</h1>
      <p className="hero-subtitle">Ask the community in plain language.</p>

      <form onSubmit={handleSubmit} className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Who can mentor me in Rust and is free this month?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="search-button" disabled={isLoading || !query.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="spin" size={18} /> Finding...
            </>
          ) : (
            <>
              <Search size={18} /> Find Helpers
            </>
          )}
        </button>
      </form>

      <div className="prompt-pills">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.25rem' }}>
          Try asking:
        </span>
        {PRESET_PROMPTS.map((prompt, index) => (
          <button
            key={index}
            type="button"
            className="prompt-pill"
            onClick={() => handlePillClick(prompt)}
            disabled={isLoading}
          >
            "{prompt}"
          </button>
        ))}
      </div>
    </div>
  );
};
