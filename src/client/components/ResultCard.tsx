import React from 'react';
import { CheckCircle2, Calendar, MapPin, Sparkles, Code2 } from 'lucide-react';
import { MatchResult } from '../api/client.js';

interface ResultCardProps {
  match: MatchResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ match }) => {
  return (
    <div className="glass-card result-card">
      <div className="card-header">
        <div>
          <h3 className="ens-name">
            <CheckCircle2 size={20} style={{ color: '#34d399' }} />
            {match.ensName}
          </h3>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            padding: '0.2rem 0.6rem',
            borderRadius: '0.4rem',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          ENS Sepolia Verified
        </span>
      </div>

      <div className="match-reason">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '0.35rem' }}>
          <Sparkles size={16} /> Why they match:
        </div>
        <div>{match.reason}</div>
      </div>

      {match.skills && match.skills.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Code2 size={14} /> Verified Skills:
          </div>
          <div className="skills-list">
            {match.skills.map((skill, i) => (
              <span key={i} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card-meta">
        {match.availability && (
          <div className="meta-item">
            <Calendar size={15} style={{ color: 'var(--accent-indigo)' }} />
            <span><strong>Availability:</strong> {match.availability}</span>
          </div>
        )}
        {match.location && (
          <div className="meta-item">
            <MapPin size={15} style={{ color: 'var(--accent-purple)' }} />
            <span><strong>Location:</strong> {match.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};
