import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, EyeOff } from 'lucide-react';

export const AdversarialNotice: React.FC = () => {
  return (
    <div
      style={{
        background: 'rgba(99, 102, 241, 0.05)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '0.85rem',
        padding: '1.25rem 1.5rem',
        marginBottom: '2.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
        <ShieldCheck size={18} /> Architecture & Security Guarantees Active
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div>
          <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Lock size={14} style={{ color: 'var(--accent-emerald)' }} /> Untrusted Data Isolation
          </strong>
          ENS profile text is treated as untrusted data and never interpolated into system prompt instructions.
        </div>
        <div>
          <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <EyeOff size={14} style={{ color: 'var(--accent-blue)' }} /> Bounded TOP_K Context
          </strong>
          Retrieval returns max 5 candidates. Entire community index is never passed to LLM.
        </div>
        <div>
          <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <AlertTriangle size={14} style={{ color: 'var(--accent-amber)' }} /> Strict Candidate Guard
          </strong>
          LLM responses are validated against retrieved ENS names. Hallucinated members are rejected.
        </div>
      </div>
    </div>
  );
};
