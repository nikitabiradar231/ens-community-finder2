import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { SearchSection } from './components/SearchSection.js';
import { ResultCard } from './components/ResultCard.js';
import { CommunitySection } from './components/CommunitySection.js';
import { AdversarialNotice } from './components/AdversarialNotice.js';
import {
  fetchCommunity,
  refreshIndex,
  searchHelpers,
  SearchResponse,
  CommunityResponse,
} from './api/client.js';
import { AlertCircle, UserX, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const data = await fetchCommunity();
      setCommunity(data);
    } catch (err: any) {
      console.error('Error fetching community data:', err);
      setError('Failed to connect to backend server.');
    }
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await searchHelpers(query);
      setSearchResult(res);
    } catch (err: any) {
      console.error('Search error:', err);
      setError('An error occurred while retrieving helpers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCommunity = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const updated = await refreshIndex();
      setCommunity(updated);
    } catch (err: any) {
      console.error('Refresh error:', err);
      setError('Failed to refresh ENS community index from Sepolia.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <SearchSection onSearch={handleSearch} isLoading={isLoading} />
      <AdversarialNotice />

      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '0.75rem',
            color: '#f87171',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {searchResult && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-indigo)' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
              Search Results for: <span style={{ color: '#60a5fa' }}>"{searchResult.query}"</span>
            </h2>
          </div>

          {searchResult.noMatch || searchResult.matches.length === 0 ? (
            <div className="no-match-box">
              <UserX size={48} style={{ color: 'var(--accent-rose)', margin: '0 auto 1rem' }} />
              <div className="no-match-title">
                Nobody in the current community matches your request.
              </div>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '0.95rem' }}>
                No verified community member on Sepolia matched your exact required skills or availability. Try broadening your request keywords.
              </p>
            </div>
          ) : (
            <div className="results-grid">
              {searchResult.matches.map((match, index) => (
                <ResultCard key={index} match={match} />
              ))}
            </div>
          )}
        </div>
      )}

      <CommunitySection
        community={community}
        onRefresh={handleRefreshCommunity}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};
