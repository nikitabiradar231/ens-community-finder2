import React from 'react';
import { ShieldCheck, Database, Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header style={{ marginBottom: '2.5rem' }}>
      <div className="header-brand">
        <span className="ens-badge">
          <Database size={14} /> Ethereum Sepolia ENS
        </span>
        <span className="ens-badge" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)' }}>
          <ShieldCheck size={14} /> Candidate Guard Active
        </span>
        <span className="ens-badge" style={{ borderColor: 'rgba(139, 92, 246, 0.3)', color: '#c084fc', background: 'rgba(139, 92, 246, 0.1)' }}>
          <Cpu size={14} /> Bounded TOP_K = 5
        </span>
      </div>
    </header>
  );
};
