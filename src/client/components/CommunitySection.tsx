import React from 'react';
import { Users, RefreshCw, Clock, ExternalLink } from 'lucide-react';
import { CommunityResponse } from '../api/client.js';

interface CommunitySectionProps {
  community: CommunityResponse | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({
  community,
  onRefresh,
  isRefreshing,
}) => {
  if (!community) return null;

  const formattedTime = community.lastRefreshedAt
    ? new Date(community.lastRefreshedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Never';

  return (
    <section className="glass-card" style={{ padding: '2rem', marginTop: '3rem' }}>
      <div className="community-header">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={22} style={{ color: 'var(--accent-indigo)' }} />
            Indexed Sepolia Community ({community.count} Members)
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} /> Last refreshed live from ENS text records: <strong>{formattedTime}</strong>
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="refresh-btn"
        >
          <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
          {isRefreshing ? 'Refreshing from ENS...' : 'Refresh Community'}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1.25rem' }}>
        {community.members.map((name) => {
          const isAdversarial = name === 'malicious.community.eth';
          return (
            <span
              key={name}
              className="member-pill"
              style={{
                borderColor: isAdversarial ? 'rgba(244, 63, 94, 0.4)' : undefined,
                color: isAdversarial ? '#fda4af' : undefined,
                background: isAdversarial ? 'rgba(244, 63, 94, 0.08)' : undefined,
              }}
              title={isAdversarial ? 'Adversarial Prompt Injection Test Identity' : `ENS identity: ${name}`}
            >
              {name} {isAdversarial ? '⚠️ [Adversarial]' : ''}
            </span>
          );
        })}
      </div>
    </section>
  );
};
