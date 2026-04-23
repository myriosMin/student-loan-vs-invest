export const LOAN = 23000;
export const MONTHS = 120;

export interface SimulateResult {
  loanH: number[];
  portH: number[];
  netH: number[];
  totalInterest: number;
  payoffMonth: number | null;
}

export interface ParetoPoint {
  pct: number;
  payoffMonth: number;
  networth: number;
  totalInterest: number;
}

export function simulate(
  budget: number,
  investFrac: number,
  annualReturn: number,
  annualLoanRate: number,
  loanAmount: number = LOAN,
): SimulateResult {
  const mr = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const mlr = annualLoanRate / 100 / 12;
  let loan = loanAmount;
  let portfolio = 0;
  let totalInterest = 0;
  let payoffMonth: number | null = null;
  const loanH = [loan];
  const portH = [0];
  const netH = [-loan];

  for (let m = 1; m <= MONTHS; m++) {
    if (loan <= 0) {
      portfolio = portfolio * (1 + mr) + budget;
      loanH.push(0);
      portH.push(portfolio);
      netH.push(portfolio);
    } else {
      const interest = loan * mlr;
      totalInterest += interest;
      let loanPay = budget * (1 - investFrac);
      let invest = budget * investFrac;
      if (loanPay < 100) {
        loanPay = Math.min(100, budget);
        invest = Math.max(0, budget - loanPay);
      }
      loan = loan + interest - loanPay;
      if (loan <= 0) {
        portfolio = portfolio * (1 + mr) + invest + -loan;
        loan = 0;
        if (!payoffMonth) payoffMonth = m;
      } else {
        portfolio = portfolio * (1 + mr) + invest;
      }
      loanH.push(Math.max(0, loan));
      portH.push(portfolio);
      netH.push(portfolio - Math.max(0, loan));
    }
  }

  return { loanH, portH, netH, totalInterest, payoffMonth };
}

export function buildPareto(
  budget: number,
  returnRate: number,
  loanRate: number,
  loanAmount: number = LOAN,
): ParetoPoint[] {
  const pts: ParetoPoint[] = [];
  for (let pct = 0; pct <= 100; pct += 5) {
    const r = simulate(budget, pct / 100, returnRate, loanRate, loanAmount);
    pts.push({
      pct,
      payoffMonth: r.payoffMonth ?? MONTHS,
      networth: r.netH[MONTHS],
      totalInterest: r.totalInterest,
    });
  }
  return pts;
}

export function fmt(n: number): string {
  return "S$" + Math.round(n).toLocaleString();
}

export const TIME_LABELS = Array.from({ length: MONTHS + 1 }, (_, i) =>
  i === 0 ? "Now" : i % 12 === 0 ? `Yr ${i / 12}` : "",
);
