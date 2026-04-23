'use client';

import { useState } from 'react';
import ExplorerTab from './ExplorerTab';
import OptimalTab from './OptimalTab';

type Tab = 'explorer' | 'optimal';

export default function LoanCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>('explorer');
  const [optimalMounted, setOptimalMounted] = useState(false);

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    if (tab === 'optimal') setOptimalMounted(true);
  }

  return (
    <>
      <div className="header">
        <h1>
          Loan vs Invest
          <br />
          <span>Planner</span>
        </h1>
        <p>DBS Tuition Fee Loan · Singapore Polytechnic</p>
      </div>

      <div className="pill-row">
        <div className="pill">
          Loan: <strong>S$23,000</strong>
        </div>
        <div className="pill">
          Rate: <strong>4.5% p.a.</strong>
        </div>
        <div className="pill">
          Max tenure: <strong>10 years</strong>
        </div>
        <div className="pill">Interest-free during study ✓</div>
      </div>

      <div className="tabs">
        <button
          className={`tab${activeTab === 'explorer' ? ' active' : ''}`}
          onClick={() => switchTab('explorer')}
        >
          🎛 Explorer
        </button>
        <button
          className={`tab${activeTab === 'optimal' ? ' active' : ''}`}
          onClick={() => switchTab('optimal')}
        >
          📐 Optimal Split
        </button>
      </div>

      <div className={`panel${activeTab === 'explorer' ? ' active' : ''}`}>
        <ExplorerTab />
      </div>

      <div className={`panel${activeTab === 'optimal' ? ' active' : ''}`}>
        {optimalMounted && <OptimalTab />}
      </div>
    </>
  );
}
