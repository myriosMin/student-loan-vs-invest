"use client";

import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import "../lib/chartSetup";
import { simulate, fmt, TIME_LABELS, MONTHS } from "../lib/calculator";
import StatCard from "./StatCard";
import ChartWrapper from "./ChartWrapper";

const C = {
  grid: "#e8d5b7",
  ticks: "#9a7f5a",
  tooltipBg: "#fff8f0",
  tooltipBorder: "#e8d5b7",
  tooltipTitle: "#2d2418",
  tooltipBody: "#9a7f5a",
};

const baseScales: ChartOptions<"line">["scales"] = {
  x: {
    grid: { color: C.grid },
    ticks: {
      color: C.ticks,
      font: { family: "DM Mono", size: 10 },
      callback: (_v: unknown, i: number) => TIME_LABELS[i] || "",
    },
  },
  y: {
    grid: { color: C.grid },
    ticks: {
      color: C.ticks,
      font: { family: "DM Mono", size: 10 },
      callback: (v) => {
        const n = v as number;
        return (
          "S$" +
          (Math.abs(n) >= 1000 ? (n / 1000).toFixed(0) + "k" : Math.round(n))
        );
      },
    },
  },
};

const lineOpts: ChartOptions<"line"> = {
  responsive: true,
  animation: { duration: 250 },
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: C.tooltipBg,
      borderColor: C.tooltipBorder,
      borderWidth: 1,
      titleColor: C.tooltipTitle,
      bodyColor: C.tooltipBody,
      callbacks: {
        label: (ctx) =>
          ` ${ctx.dataset.label}: S$${Math.round(ctx.raw as number).toLocaleString()}`,
      },
    },
  },
  scales: baseScales,
};

type Props = {
  budget: number;
  returnRate: number;
  loanRate: number;
  loanAmount: number;
};

export default function ExplorerTab({ budget, returnRate, loanRate, loanAmount }: Props) {
  const [investPct, setInvestPct] = useState(30);

  const investFrac = investPct / 100;
  const debtAmt = Math.max(100, budget * (1 - investFrac));
  const investAmt = budget * investFrac;

  const r = useMemo(
    () => simulate(budget, investFrac, returnRate, loanRate, loanAmount),
    [budget, investFrac, returnRate, loanRate, loanAmount],
  );
  const rD = useMemo(
    () => simulate(budget, 0, returnRate, loanRate, loanAmount),
    [budget, returnRate, loanRate, loanAmount],
  );
  const rI = useMemo(
    () => simulate(budget, 0.9, returnRate, loanRate, loanAmount),
    [budget, returnRate, loanRate, loanAmount],
  );

  const payMo = r.payoffMonth ?? MONTHS;
  const spread = returnRate - loanRate;
  const netEnd = r.netH[MONTHS];
  const netDebt = rD.netH[MONTHS];
  const diff = fmt(Math.abs(netEnd - netDebt));
  const better = netEnd >= netDebt;
  const netVsDebt = netEnd - netDebt;
  const diffSigned =
    (netVsDebt >= 0 ? "+" : "−") +
    "S$" +
    Math.abs(Math.round(netVsDebt)).toLocaleString();

  let verdictHtml = "";
  if (spread > 2) {
    verdictHtml = `Your return (${returnRate}%) beats the loan rate (${loanRate.toFixed(1)}%) by <span class="good">${spread.toFixed(1)}%</span>. Investing more wins mathematically. Your ${investPct}% invest split gives a 10-year net worth of <strong>${fmt(netEnd)}</strong>, which is <span class="${better ? "good" : "bad"}">${diff} ${better ? "ahead of" : "behind"} paying debt first</span>. See the Optimal Split tab to find your personal best allocation.`;
  } else if (spread > 0) {
    verdictHtml = `Your return (${returnRate}%) is only slightly above the loan rate (${loanRate.toFixed(1)}%) — a spread of just ${spread.toFixed(1)}%. After investment fees, this gap may vanish. The difference between strategies over 10 years is only <strong>${diff}</strong>. Paying more toward the loan gives more certainty.`;
  } else {
    verdictHtml = `Your loan rate (${loanRate.toFixed(1)}%) <span class="bad">exceeds your expected return (${returnRate}%)</span>. Every dollar invested earns less than what it costs in interest. Paying off debt first is optimal here — it's a guaranteed ${loanRate.toFixed(1)}% return.`;
  }

  const mainData = {
    labels: TIME_LABELS,
    datasets: [
      {
        label: "Loan balance",
        data: r.loanH,
        borderColor: "#e05252",
        backgroundColor: "rgba(224,82,82,0.07)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Portfolio",
        data: r.portH,
        borderColor: "#2d9c6e",
        backgroundColor: "rgba(45,156,110,0.07)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Net worth",
        data: r.netH,
        borderColor: "#d4870a",
        backgroundColor: "rgba(212,135,10,0.04)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [5, 3],
      },
    ],
  };

  const compareData = {
    labels: TIME_LABELS,
    datasets: [
      {
        label: "Pay debt first",
        data: rD.netH,
        borderColor: "#e05252",
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Invest first (min loan)",
        data: rI.netH,
        borderColor: "#2d9c6e",
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Your split",
        data: r.netH,
        borderColor: "#7c6af7",
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2.5,
        fill: false,
      },
    ],
  };

  return (
    <>
      <div className="controls">
        <h2>Allocation</h2>

        <div className="slider-group">
          <div className="slider-label">
            <span>% going to investments</span>
            <span className="val">{investPct}%</span>
          </div>
          <input
            type="range"
            className="invest-slider"
            min={0}
            max={100}
            step={5}
            value={investPct}
            onChange={(e) => setInvestPct(Number(e.target.value))}
          />
          <div className="split-viz">
            <div
              className="split-debt"
              style={{ width: `${100 - investPct}%` }}
            />
            <div className="split-invest" style={{ width: `${investPct}%` }} />
          </div>
          <div className="split-labels">
            <span className="dl">Loan: {fmt(debtAmt)}</span>
            <span className="il">Invest: {fmt(investAmt)}</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Loan paid off"
          value={payMo < MONTHS ? `${(payMo / 12).toFixed(1)} yrs` : ">10 yrs"}
          sub={payMo < MONTHS ? `(${payMo} months)` : "loan not cleared"}
          valueClass="debt-val"
        />
        <StatCard
          label="Total interest paid"
          value={fmt(r.totalInterest)}
          sub="to the bank"
          valueClass="debt-val"
        />
        <StatCard
          label="Net worth at 10yr"
          value={fmt(r.netH[MONTHS])}
          sub="portfolio − remaining loan"
          valueClass="invest-val"
        />
        <StatCard
          label="vs Debt-first at 10yr"
          value={diffSigned}
          sub={netVsDebt >= 0 ? "your split wins" : "debt-first wins"}
          valueClass={netVsDebt >= 0 ? "invest-val" : "debt-val"}
        />
      </div>

      <ChartWrapper
        title="Loan balance & portfolio over time"
        legend={[
          { color: "#e05252", label: "Loan balance" },
          { color: "#2d9c6e", label: "Portfolio" },
          { color: "#d4870a", label: "Net worth" },
        ]}
      >
        <Line data={mainData as never} options={lineOpts} />
      </ChartWrapper>

      <ChartWrapper
        title="Strategy comparison — net worth over time"
        legend={[
          { color: "#e05252", label: "Pay debt first" },
          { color: "#2d9c6e", label: "Invest first (min loan)" },
          { color: "#7c6af7", label: "Your split" },
        ]}
      >
        <Line data={compareData as never} options={lineOpts} />
      </ChartWrapper>

      <div className="verdict">
        <h3>📊 Analysis</h3>
        <div
          className="verdict-content"
          dangerouslySetInnerHTML={{ __html: verdictHtml }}
        />
      </div>
    </>
  );
}
