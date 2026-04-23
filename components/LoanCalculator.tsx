"use client";

import { useState, useMemo } from "react";
import { MONTHS, MONTHS_UNI } from "../lib/calculator";
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

  const [polyOn, setPolyOn] = useState(true);
  const [uniOn, setUniOn] = useState(false);
  const [customOn, setCustomOn] = useState(false);
  const [customVal, setCustomVal] = useState(23000);

  const [useTFL, setUseTFL] = useState(false);
  const [tflRate, setTflRate] = useState<number | null>(null);
  const [tflLoading, setTflLoading] = useState(false);

  async function toggleTFL() {
    if (useTFL) {
      setUseTFL(false);
      return;
    }
    setUseTFL(true);
    if (tflRate !== null) return;
    setTflLoading(true);
    try {
      const res = await fetch("/api/sora");
      const data = await res.json();
      if (typeof data.tflRate === "number") {
        setTflRate(data.tflRate);
      } else {
        setUseTFL(false);
      }
    } catch {
      setUseTFL(false);
    } finally {
      setTflLoading(false);
    }
  }

  const effectiveLoanRate = useTFL && tflRate !== null ? tflRate : loanRate;

  const loanAmount = useMemo(() => {
    if (customOn) return customVal;
    return (polyOn ? 24000 : 0) + (uniOn ? 32000 : 0);
  }, [customOn, customVal, polyOn, uniOn]);

  const horizon = uniOn ? MONTHS_UNI : MONTHS;

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
          Rate: <strong>~4% p.a.</strong>
        </div>
        <div className="pill">Interest-free during study ✓</div>
        <div className="pill">
          Max tenure: <strong>10 years</strong> for poly,{" "}
          <strong>20 years</strong> for uni
        </div>
      </div>

      <SharedInputs
        budget={budget}
        setBudget={setBudget}
        returnRate={returnRate}
        setReturnRate={setReturnRate}
        loanRate={loanRate}
        setLoanRate={setLoanRate}
        polyOn={polyOn}
        setPolyOn={setPolyOn}
        uniOn={uniOn}
        setUniOn={setUniOn}
        customOn={customOn}
        setCustomOn={setCustomOn}
        customVal={customVal}
        setCustomVal={setCustomVal}
        loanAmount={loanAmount}
        useTFL={useTFL}
        tflLoading={tflLoading}
        tflRate={tflRate}
        onToggleTFL={toggleTFL}
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
        <div
          className={`panel panel-explorer${activeTab === "explorer" ? " active" : ""}`}
        >
          <ExplorerTab
            budget={budget}
            returnRate={returnRate}
            loanRate={effectiveLoanRate}
            loanAmount={loanAmount}
            horizon={horizon}
          />
        </div>

        <div
          className={`panel panel-optimal${activeTab === "optimal" ? " active" : ""}`}
        >
          {optimalMounted && (
            <OptimalTab
              budget={budget}
              returnRate={returnRate}
              loanRate={effectiveLoanRate}
              loanAmount={loanAmount}
              horizon={horizon}
            />
          )}
        </div>
      </div>
    </>
  );
}
