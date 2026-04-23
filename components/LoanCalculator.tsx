"use client";

import { useState } from "react";
import ExplorerTab from "./ExplorerTab";
import OptimalTab from "./OptimalTab";
import SharedInputs from "./SharedInputs";

type Tab = "explorer" | "optimal";

export default function LoanCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>("explorer");
  const [optimalMounted, setOptimalMounted] = useState(false);

  const [budget, setBudget] = useState(600);
  const [returnRate, setReturnRate] = useState(7);
  const [loanRate, setLoanRate] = useState(4.5);

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    if (tab === "optimal") setOptimalMounted(true);
  }

  return (
    <>
      <div className="header">
        <h1>
          Loan vs Invest
          <br />
          <span>Planner</span>
        </h1>
        <p>Tuition Fee Loan · Singapore Studies</p>
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

      <SharedInputs
        budget={budget}
        setBudget={setBudget}
        returnRate={returnRate}
        setReturnRate={setReturnRate}
        loanRate={loanRate}
        setLoanRate={setLoanRate}
      />

      <div className={`tabs${activeTab === "optimal" ? " at-optimal" : ""}`}>
        <div className="tab-indicator" />
        <button
          className={`tab${activeTab === "explorer" ? " active" : ""}`}
          onClick={() => switchTab("explorer")}
        >
          Explorer
        </button>
        <button
          className={`tab${activeTab === "optimal" ? " active" : ""}`}
          onClick={() => switchTab("optimal")}
        >
          Optimal Split
        </button>
      </div>

      <div className="panels-wrapper">
        <div className={`panel panel-explorer${activeTab === "explorer" ? " active" : ""}`}>
          <ExplorerTab budget={budget} returnRate={returnRate} loanRate={loanRate} />
        </div>

        <div className={`panel panel-optimal${activeTab === "optimal" ? " active" : ""}`}>
          {optimalMounted && (
            <OptimalTab budget={budget} returnRate={returnRate} loanRate={loanRate} />
          )}
        </div>
      </div>
    </>
  );
}
