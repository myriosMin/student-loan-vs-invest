"use client";

import { useState, useMemo } from "react";

interface Inputs {
  loanBalance: number;
  loanInterestRate: number;
  minimumMonthlyPayment: number;
  extraMonthlyPayment: number;
  investmentReturnRate: number;
  taxRate: number;
}

interface YearlySnapshot {
  year: number;
  loanBalance: number;
  totalInterestPaid: number;
  investmentValue: number;
  netWorth: number;
}

interface LoanPayoffResult {
  months: number | null;
  totalInterest: number | null;
  schedule: number[];
  canPayOff: boolean;
  error: string | null;
}

const PAYMENT_TOO_LOW_ERROR =
  "Monthly payment does not cover accrued interest — the loan will never be paid off.";

function calculateLoanPayoff(
  balance: number,
  annualRate: number,
  monthlyPayment: number
): LoanPayoffResult {
  const monthlyRate = annualRate / 100 / 12;
  let remaining = balance;
  let months = 0;
  let totalInterest = 0;
  const schedule: number[] = [balance];

  if (remaining <= 0.01) {
    return { months: 0, totalInterest: 0, schedule, canPayOff: true, error: null };
  }

  const firstMonthInterest = remaining * monthlyRate;
  if (monthlyPayment <= firstMonthInterest) {
    return {
      months: null,
      totalInterest: null,
      schedule,
      canPayOff: false,
      error: PAYMENT_TOO_LOW_ERROR,
    };
  }

  while (remaining > 0.01 && months < 600) {
    const interest = remaining * monthlyRate;
    const principal = Math.min(monthlyPayment - interest, remaining);
    if (principal <= 0) {
      return {
        months: null,
        totalInterest: null,
        schedule,
        canPayOff: false,
        error: PAYMENT_TOO_LOW_ERROR,
      };
    }
    totalInterest += interest;
    remaining -= principal;
    months++;
    if (months % 12 === 0) schedule.push(Math.max(0, remaining));
  }

  return { months, totalInterest, schedule, canPayOff: true, error: null };
}

function buildYearlySnapshots(inputs: Inputs): YearlySnapshot[] {
  const {
    loanBalance,
    loanInterestRate,
    minimumMonthlyPayment,
    extraMonthlyPayment,
    investmentReturnRate,
    taxRate,
  } = inputs;

  const totalMonthlyPayment = minimumMonthlyPayment + extraMonthlyPayment;
  const monthlyLoanRate = loanInterestRate / 100 / 12;
  const monthlyInvestRate = investmentReturnRate / 100 / 12;
  const netInvestRate = monthlyInvestRate * (1 - taxRate / 100);

  // Scenario A: Pay extra on loan, invest nothing extra during payoff period,
  // then invest everything (min + extra) after loan is paid off.

  const maxYears = 30;
  const snapshots: YearlySnapshot[] = [];

  let loanBal = loanBalance;
  let invest = 0;
  let totalInterest = 0;

  for (let month = 1; month <= maxYears * 12; month++) {
    const year = Math.ceil(month / 12);

    if (loanBal > 0.01) {
      const interest = loanBal * monthlyLoanRate;
      const payment = Math.min(totalMonthlyPayment, loanBal + interest);
      totalInterest += interest;
      loanBal = Math.max(0, loanBal - (payment - interest));
    } else {
      // Loan paid off — now invest the full payment amount
      invest = invest * (1 + netInvestRate) + totalMonthlyPayment;
    }

    if (month % 12 === 0) {
      snapshots.push({
        year,
        loanBalance: parseFloat(loanBal.toFixed(2)),
        totalInterestPaid: parseFloat(totalInterest.toFixed(2)),
        investmentValue: parseFloat(invest.toFixed(2)),
        netWorth: parseFloat((invest - loanBal).toFixed(2)),
      });
    }
  }

  return snapshots;
}

function buildScenarioBSnapshots(inputs: Inputs): YearlySnapshot[] {
  const {
    loanBalance,
    loanInterestRate,
    minimumMonthlyPayment,
    extraMonthlyPayment,
    investmentReturnRate,
    taxRate,
  } = inputs;

  const totalMonthlyPayment = minimumMonthlyPayment + extraMonthlyPayment;
  const monthlyLoanRate = loanInterestRate / 100 / 12;
  const monthlyInvestRate = investmentReturnRate / 100 / 12;
  const netInvestRate = monthlyInvestRate * (1 - taxRate / 100);

  const maxYears = 30;
  const snapshots: YearlySnapshot[] = [];

  let loanBal = loanBalance;
  let invest = 0;
  let totalInterest = 0;

  for (let month = 1; month <= maxYears * 12; month++) {
    const year = Math.ceil(month / 12);

    if (loanBal > 0.01) {
      const interest = loanBal * monthlyLoanRate;
      const payment = Math.min(minimumMonthlyPayment, loanBal + interest);
      totalInterest += interest;
      loanBal = Math.max(0, loanBal - (payment - interest));
      invest = invest * (1 + netInvestRate) + extraMonthlyPayment;
    } else {
      invest = invest * (1 + netInvestRate) + totalMonthlyPayment;
    }

    if (month % 12 === 0) {
      snapshots.push({
        year,
        loanBalance: parseFloat(loanBal.toFixed(2)),
        totalInterestPaid: parseFloat(totalInterest.toFixed(2)),
        investmentValue: parseFloat(invest.toFixed(2)),
        netWorth: parseFloat((invest - loanBal).toFixed(2)),
      });
    }
  }

  return snapshots;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function Home() {
  const [inputs, setInputs] = useState<Inputs>({
    loanBalance: 30000,
    loanInterestRate: 6.5,
    minimumMonthlyPayment: 300,
    extraMonthlyPayment: 200,
    investmentReturnRate: 7,
    taxRate: 25,
  });

  const [activeTab, setActiveTab] = useState<"table" | "summary">("summary");

  const set = (field: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const val = rawValue === "" ? 0 : parseFloat(rawValue);
    if (!isNaN(val)) setInputs((prev) => ({ ...prev, [field]: val }));
  };

  const loanPayoff = useMemo(
    () =>
      calculateLoanPayoff(
        inputs.loanBalance,
        inputs.loanInterestRate,
        inputs.minimumMonthlyPayment + inputs.extraMonthlyPayment
      ),
    [inputs]
  );

  const minPayoff = useMemo(
    () =>
      calculateLoanPayoff(
        inputs.loanBalance,
        inputs.loanInterestRate,
        inputs.minimumMonthlyPayment
      ),
    [inputs]
  );

  const scenarioA = useMemo(() => buildYearlySnapshots(inputs), [inputs]);
  const scenarioB = useMemo(() => buildScenarioBSnapshots(inputs), [inputs]);

  const payoffYearsA = loanPayoff.months != null ? Math.ceil(loanPayoff.months / 12) : null;
  const payoffYearsB = minPayoff.months != null ? Math.ceil(minPayoff.months / 12) : null;

  const at30A = scenarioA[scenarioA.length - 1];
  const at30B = scenarioB[scenarioB.length - 1];

  const displayYears = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30];

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">
            Student Loan vs. Invest Calculator
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Compare paying off your student loan early versus investing the
            extra money.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Input Section */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="loanBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Loan Balance ($)
            </label>
            <input
              id="loanBalance"
              type="number"
              min={0}
              value={inputs.loanBalance}
              onChange={set("loanBalance")}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="loanInterestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Loan Interest Rate (%)
            </label>
            <input
              id="loanInterestRate"
              type="number"
              min={0}
              step={0.1}
              value={inputs.loanInterestRate}
              onChange={set("loanInterestRate")}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="minimumMonthlyPayment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Minimum Monthly Payment ($)
            </label>
            <input
              id="minimumMonthlyPayment"
              type="number"
              min={0}
              value={inputs.minimumMonthlyPayment}
              onChange={set("minimumMonthlyPayment")}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="extraMonthlyPayment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Extra Monthly Amount ($)
            </label>
            <input
              id="extraMonthlyPayment"
              type="number"
              min={0}
              value={inputs.extraMonthlyPayment}
              onChange={set("extraMonthlyPayment")}
              aria-describedby="extraMonthlyPayment-hint"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p id="extraMonthlyPayment-hint" className="text-xs text-gray-400">
              Applied to loan (A) or investments (B) each month
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="investmentReturnRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Expected Investment Return (%)
            </label>
            <input
              id="investmentReturnRate"
              type="number"
              min={0}
              step={0.1}
              value={inputs.investmentReturnRate}
              onChange={set("investmentReturnRate")}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Capital Gains Tax Rate (%)
            </label>
            <input
              id="taxRate"
              type="number"
              min={0}
              max={100}
              step={1}
              value={inputs.taxRate}
              onChange={set("taxRate")}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </section>

        {/* Scenario Cards */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-5">
            <h2 className="text-base font-semibold text-blue-800 dark:text-blue-200">
              Scenario A — Pay Off Loan Early
            </h2>
            <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
              Put the extra {fmt(inputs.extraMonthlyPayment)}/mo toward your
              loan, then invest everything after payoff.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">
                  Payoff time
                </dt>
                <dd className="font-semibold text-blue-700 dark:text-blue-300">
                  {loanPayoff.canPayOff && loanPayoff.months != null && loanPayoff.months > 0
                    ? `${payoffYearsA} yr${payoffYearsA !== 1 ? "s" : ""} (${loanPayoff.months} mo)`
                    : loanPayoff.canPayOff
                    ? "Already paid"
                    : "Never"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">
                  Interest paid
                </dt>
                <dd className="font-semibold text-blue-700 dark:text-blue-300">
                  {loanPayoff.totalInterest != null ? fmt(loanPayoff.totalInterest) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">
                  Portfolio at 30 yrs
                </dt>
                <dd className="font-semibold text-blue-700 dark:text-blue-300">
                  {fmt(at30A?.investmentValue ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">
                  Net worth at 30 yrs
                </dt>
                <dd className="font-semibold text-blue-700 dark:text-blue-300">
                  {fmt(at30A?.netWorth ?? 0)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-5">
            <h2 className="text-base font-semibold text-green-800 dark:text-green-200">
              Scenario B — Invest the Extra
            </h2>
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              Pay minimums on the loan, invest the extra{" "}
              {fmt(inputs.extraMonthlyPayment)}/mo immediately.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">
                  Payoff time
                </dt>
                <dd className="font-semibold text-green-700 dark:text-green-300">
                  {minPayoff.canPayOff && minPayoff.months != null && minPayoff.months > 0
                    ? `${payoffYearsB} yr${payoffYearsB !== 1 ? "s" : ""} (${minPayoff.months} mo)`
                    : minPayoff.canPayOff
                    ? "Already paid"
                    : "Never"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">
                  Interest paid
                </dt>
                <dd className="font-semibold text-green-700 dark:text-green-300">
                  {minPayoff.totalInterest != null ? fmt(minPayoff.totalInterest) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">
                  Portfolio at 30 yrs
                </dt>
                <dd className="font-semibold text-green-700 dark:text-green-300">
                  {fmt(at30B?.investmentValue ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">
                  Net worth at 30 yrs
                </dt>
                <dd className="font-semibold text-green-700 dark:text-green-300">
                  {fmt(at30B?.netWorth ?? 0)}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Payment warning */}
        {(!loanPayoff.canPayOff || !minPayoff.canPayOff) && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-5 py-3 text-sm text-amber-800 dark:text-amber-200">
            ⚠️{" "}
            {!loanPayoff.canPayOff && !minPayoff.canPayOff
              ? "Both scenarios: " + PAYMENT_TOO_LOW_ERROR
              : !loanPayoff.canPayOff
              ? "Scenario A: " + loanPayoff.error
              : "Scenario B: " + minPayoff.error}
            {" "}Increase the monthly payment to see payoff projections.
          </div>
        )}

        {/* Winner Banner */}
        {at30A && at30B && (
          <div
            className={`rounded-lg px-5 py-3 text-sm font-medium ${
              at30A.netWorth >= at30B.netWorth
                ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
            }`}
          >
            {at30A.netWorth >= at30B.netWorth ? (
              <>
                📘 Over 30 years,{" "}
                <strong>Scenario A (Pay Off Loan Early)</strong> comes out ahead
                by{" "}
                <strong>{fmt(at30A.netWorth - at30B.netWorth)}</strong> in net
                worth.
              </>
            ) : (
              <>
                📗 Over 30 years,{" "}
                <strong>Scenario B (Invest the Extra)</strong> comes out ahead
                by{" "}
                <strong>{fmt(at30B.netWorth - at30A.netWorth)}</strong> in net
                worth.
              </>
            )}
          </div>
        )}

        {/* Tabs */}
        <section>
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "summary"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "table"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Year-by-Year Table
            </button>
          </div>

          {activeTab === "summary" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Year
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-blue-600 dark:text-blue-400">
                      A — Portfolio
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-blue-600 dark:text-blue-400">
                      A — Net Worth
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-green-600 dark:text-green-400">
                      B — Portfolio
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-green-600 dark:text-green-400">
                      B — Net Worth
                    </th>
                    <th className="text-right py-2 pl-3 font-medium text-gray-600 dark:text-gray-400">
                      Difference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayYears.map((y) => {
                    const a = scenarioA[y - 1];
                    const b = scenarioB[y - 1];
                    if (!a || !b) return null;
                    const diff = a.netWorth - b.netWorth;
                    return (
                      <tr
                        key={y}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-2 pr-4 text-gray-700 dark:text-gray-300 font-medium">
                          {y}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-700 dark:text-blue-300">
                          {fmt(a.investmentValue)}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-700 dark:text-blue-300">
                          {fmt(a.netWorth)}
                        </td>
                        <td className="py-2 px-3 text-right text-green-700 dark:text-green-300">
                          {fmt(b.investmentValue)}
                        </td>
                        <td className="py-2 px-3 text-right text-green-700 dark:text-green-300">
                          {fmt(b.netWorth)}
                        </td>
                        <td
                          className={`py-2 pl-3 text-right font-medium ${
                            diff >= 0
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {diff >= 0 ? "A +" : "B +"}
                          {fmt(Math.abs(diff))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Year
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-blue-600 dark:text-blue-400">
                      A — Loan Bal
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-blue-600 dark:text-blue-400">
                      A — Interest Paid
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-blue-600 dark:text-blue-400">
                      A — Portfolio
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-green-600 dark:text-green-400">
                      B — Loan Bal
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-green-600 dark:text-green-400">
                      B — Interest Paid
                    </th>
                    <th className="text-right py-2 pl-3 font-medium text-green-600 dark:text-green-400">
                      B — Portfolio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioA.map((a, i) => {
                    const b = scenarioB[i];
                    if (!b) return null;
                    return (
                      <tr
                        key={a.year}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-2 pr-4 text-gray-700 dark:text-gray-300 font-medium">
                          {a.year}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-700 dark:text-blue-300">
                          {fmt(a.loanBalance)}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-700 dark:text-blue-300">
                          {fmt(a.totalInterestPaid)}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-700 dark:text-blue-300">
                          {fmt(a.investmentValue)}
                        </td>
                        <td className="py-2 px-3 text-right text-green-700 dark:text-green-300">
                          {fmt(b.loanBalance)}
                        </td>
                        <td className="py-2 px-3 text-right text-green-700 dark:text-green-300">
                          {fmt(b.totalInterestPaid)}
                        </td>
                        <td className="py-2 pl-3 text-right text-green-700 dark:text-green-300">
                          {fmt(b.investmentValue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <footer className="text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-4">
          <p>
            ⚠️ This calculator is for informational purposes only and does not
            constitute financial advice. Returns are not guaranteed. Consult a
            qualified financial advisor before making investment decisions.
          </p>
        </footer>
      </div>
    </main>
  );
}
