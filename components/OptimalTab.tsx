'use client';

import { useState, useMemo } from 'react';
import { Scatter, Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import '../lib/chartSetup';
import { buildPareto, fmt, MONTHS } from '../lib/calculator';
import SliderGroup from './SliderGroup';
import ChartWrapper from './ChartWrapper';

const C = {
  grid: '#e8d5b7',
  ticks: '#9a7f5a',
  tooltipBg: '#fff8f0',
  tooltipBorder: '#e8d5b7',
  tooltipTitle: '#2d2418',
  tooltipBody: '#9a7f5a',
};

export default function OptimalTab() {
  const [budget, setBudget] = useState(600);
  const [returnRate, setReturnRate] = useState(7);
  const [loanRate, setLoanRate] = useState(4.5);

  const pareto = useMemo(
    () => buildPareto(budget, returnRate, loanRate),
    [budget, returnRate, loanRate]
  );

  const best = useMemo(
    () => pareto.reduce((b, p) => (p.networth > b.networth ? p : b), pareto[0]),
    [pareto]
  );

  const spread = returnRate - loanRate;
  const fastPayoff = pareto[0].payoffMonth;
  const bestPayoff = best.payoffMonth;
  const gain = fmt(best.networth - pareto[0].networth);
  const loanAmt = fmt(Math.max(100, budget * (1 - best.pct / 100)));
  const invAmt = fmt((budget * best.pct) / 100);

  const isPositive = spread > 0;

  const calloutTitle = isPositive
    ? `✦ Optimal split: invest ${best.pct}% / repay ${100 - best.pct}%`
    : '✦ Optimal: pay off loan first';

  const calloutBody = isPositive
    ? `At ${fmt(budget)}/mo with a <strong>${spread.toFixed(1)}% return spread</strong>, the math says put <strong class="g">${invAmt}/mo into investments</strong> and <strong class="g">${loanAmt}/mo toward the loan</strong>.<br><br>This maximises your 10-year net worth at <strong>${fmt(best.networth)}</strong> — <span class="g">${gain} more</span> than paying debt only. The loan clears in <strong>${bestPayoff < MONTHS ? (bestPayoff / 12).toFixed(1) + 'yr' : '>10yr'}</strong> vs <strong>${fastPayoff ? (fastPayoff / 12).toFixed(1) + 'yr' : '>10yr'}</strong> if you paid debt-first.<br><br>Note: when return > loan rate, the model almost always recommends maximising investing (paying minimum $100/mo on loan). The frontier is relatively flat beyond ~60% invest — meaning you gain little extra by going to 90–100% invest, but you take on much more risk of not covering the loan if income drops.`
    : `Your loan rate (${loanRate.toFixed(1)}%) is higher than your expected return (${returnRate}%). Every dollar invested earns less than it costs you in interest. The math says <strong class="r">pay off the loan first</strong> — it's a guaranteed ${loanRate.toFixed(1)}% risk-free return. Once cleared, redirect everything into investing.`;

  const scatterOpts = useMemo<ChartOptions<'scatter'>>(
    () => ({
      responsive: true,
      animation: { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: C.tooltipBg,
          borderColor: C.tooltipBorder,
          borderWidth: 1,
          titleColor: C.tooltipTitle,
          bodyColor: C.tooltipBody,
          callbacks: {
            title: () => '',
            label: (ctx) => {
              const p = pareto[ctx.dataIndex];
              return [
                ` Invest ${p.pct}% / Loan ${100 - p.pct}%`,
                ` Payoff: ${
                  p.payoffMonth < MONTHS
                    ? (p.payoffMonth / 12).toFixed(1) + 'yr (' + p.payoffMonth + 'mo)'
                    : '>10 yrs'
                }`,
                ` Net worth at 10yr: S$${Math.round(p.networth).toLocaleString()}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '← faster payoff  |  loan payoff time (months)  |  slower payoff →',
            color: C.ticks,
            font: { family: 'DM Mono', size: 10 },
          },
          grid: { color: C.grid },
          ticks: {
            color: C.ticks,
            font: { family: 'DM Mono', size: 10 },
            callback: (v) => ((v as number) < MONTHS ? v + 'mo' : '>10yr'),
          },
        },
        y: {
          title: {
            display: true,
            text: '10-year net worth →',
            color: C.ticks,
            font: { family: 'DM Mono', size: 10 },
          },
          grid: { color: C.grid },
          ticks: {
            color: C.ticks,
            font: { family: 'DM Mono', size: 10 },
            callback: (v) => 'S$' + ((v as number) / 1000).toFixed(0) + 'k',
          },
        },
      },
    }),
    [pareto]
  );

  const barOpts = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      animation: { duration: 300 },
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
              ` Net worth: S$${Math.round(ctx.raw as number).toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: C.grid },
          ticks: { color: C.ticks, font: { family: 'DM Mono', size: 10 } },
        },
        y: {
          grid: { color: C.grid },
          ticks: {
            color: C.ticks,
            font: { family: 'DM Mono', size: 10 },
            callback: (v) => 'S$' + ((v as number) / 1000).toFixed(0) + 'k',
          },
        },
      },
    }),
    []
  );

  const scatterData = {
    datasets: [
      {
        label: 'Split',
        data: pareto.map((p) => ({ x: p.payoffMonth, y: p.networth })),
        backgroundColor: pareto.map((p) =>
          p.pct === best.pct ? '#d4870a' : p.pct === 0 ? '#e05252' : '#7c6af7aa'
        ),
        pointRadius: pareto.map((p) =>
          p.pct === best.pct || p.pct === 0 ? 9 : 5
        ),
        pointHoverRadius: 12,
      },
    ],
  };

  const barData = {
    labels: pareto.map((p) => `${p.pct}%`),
    datasets: [
      {
        label: 'Net worth at 10yr',
        data: pareto.map((p) => p.networth),
        backgroundColor: pareto.map((p) =>
          p.pct === best.pct ? '#d4870a' : p.networth < 0 ? '#e0525244' : '#7c6af744'
        ),
        borderColor: pareto.map((p) =>
          p.pct === best.pct ? '#d4870a' : p.networth < 0 ? '#e05252' : '#7c6af7'
        ),
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  return (
    <>
      <div className="controls">
        <h2>Assumptions</h2>
        <SliderGroup
          label="Monthly budget"
          value={fmt(budget)}
          min={200}
          max={2000}
          step={50}
          current={budget}
          onChange={setBudget}
        />
        <div className="rate-row">
          <SliderGroup
            label="Investment return (% p.a.)"
            value={`${returnRate.toFixed(1)}%`}
            min={3}
            max={15}
            step={0.5}
            current={returnRate}
            onChange={setReturnRate}
            noMargin
          />
          <SliderGroup
            label="Loan interest rate"
            value={`${loanRate.toFixed(1)}%`}
            min={2}
            max={8}
            step={0.1}
            current={loanRate}
            onChange={setLoanRate}
            noMargin
          />
        </div>
      </div>

      <div className={`optimal-callout ${isPositive ? 'green' : 'yellow'}`}>
        <h3 className={isPositive ? 'green' : 'yellow'}>{calloutTitle}</h3>
        <p dangerouslySetInnerHTML={{ __html: calloutBody }} />
      </div>

      <ChartWrapper
        title="Pareto Frontier — the tradeoff curve"
        subtitle="Every dot is a different invest% split. Moving right = slower payoff. Moving up = higher net worth. The frontier shows exactly what you trade off between wealth and speed."
        note="★ gold = mathematically optimal (max net worth) · red = debt-first (fastest payoff) · each dot = 5% increment"
      >
        <Scatter data={scatterData as never} options={scatterOpts} height={300} />
      </ChartWrapper>

      <ChartWrapper
        title="Net worth at 10 years — by invest %"
        subtitle="The highlighted bar is your mathematical optimum. Bars to the left = more debt focus. Bars to the right = more investing."
      >
        <Bar data={barData as never} options={barOpts} height={220} />
      </ChartWrapper>

      <div className="optimal-callout yellow">
        <h3 className="yellow">⚠️ Real-world caveats</h3>
        <p>
          <span className="r">① Investment returns aren&apos;t guaranteed.</span> 7% is a
          long-run average — in any 3-year stretch you could be down 30% while the loan keeps
          accruing.
          <br />
          <br />
          <span className="r">② Psychological debt stress matters.</span> Being debt-free has
          non-financial value — it gives you more job flexibility and peace of mind.
          <br />
          <br />
          <span className="g">③ Time in market is powerful.</span> Starting to invest S$100/mo
          early beats waiting until the loan clears — the first years of compounding are the most
          valuable.
          <br />
          <br />
          <strong>Practical recommendation:</strong> Pay minimum ($100/mo) on the loan, build a
          3-month emergency fund first, then invest the rest. Don&apos;t go 100% invest unless you
          have very stable income.
        </p>
      </div>
    </>
  );
}
