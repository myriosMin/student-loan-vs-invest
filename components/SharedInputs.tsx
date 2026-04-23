'use client';

import { fmt } from '../lib/calculator';
import SliderGroup from './SliderGroup';

type Props = {
  budget: number;
  setBudget: (v: number) => void;
  returnRate: number;
  setReturnRate: (v: number) => void;
  loanRate: number;
  setLoanRate: (v: number) => void;
};

export default function SharedInputs({
  budget,
  setBudget,
  returnRate,
  setReturnRate,
  loanRate,
  setLoanRate,
}: Props) {
  return (
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
  );
}
