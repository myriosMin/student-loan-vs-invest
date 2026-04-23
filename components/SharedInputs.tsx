"use client";

import { fmt } from "../lib/calculator";
import SliderGroup from "./SliderGroup";

type Props = {
  budget: number;
  setBudget: (v: number) => void;
  returnRate: number;
  setReturnRate: (v: number) => void;
  loanRate: number;
  setLoanRate: (v: number) => void;
  polyOn: boolean;
  setPolyOn: (v: boolean) => void;
  uniOn: boolean;
  setUniOn: (v: boolean) => void;
  customOn: boolean;
  setCustomOn: (v: boolean) => void;
  customVal: number;
  setCustomVal: (v: number) => void;
  loanAmount: number;
};

export default function SharedInputs({
  budget,
  setBudget,
  returnRate,
  setReturnRate,
  loanRate,
  setLoanRate,
  polyOn,
  setPolyOn,
  uniOn,
  setUniOn,
  customOn,
  setCustomOn,
  customVal,
  setCustomVal,
  loanAmount,
}: Props) {
  function handlePolyClick() {
    setCustomOn(false);
    setPolyOn(!polyOn);
  }

  function handleUniClick() {
    setCustomOn(false);
    setUniOn(!uniOn);
  }

  function handleCustomClick() {
    setCustomOn(true);
    setPolyOn(false);
    setUniOn(false);
  }

  return (
    <div className="controls">
      <h2>Assumptions</h2>

      <div className="slider-group">
        <div className="slider-label">
          <span>Loan amount</span>
          <span className="val">{fmt(loanAmount)}</span>
        </div>
        <div className="loan-toggles">
          <button
            className={`loan-toggle${polyOn && !customOn ? " active" : ""}`}
            onClick={handlePolyClick}
          >
            Poly <span className="loan-toggle-amt">S$24k</span>
          </button>
          <button
            className={`loan-toggle${uniOn && !customOn ? " active" : ""}`}
            onClick={handleUniClick}
          >
            Uni <span className="loan-toggle-amt">S$32k</span>
          </button>
          <button
            className={`loan-toggle${customOn ? " active" : ""}`}
            onClick={handleCustomClick}
          >
            Custom
          </button>
        </div>
        {!customOn && (polyOn || uniOn) && (
          <p className="loan-toggle-hint">
            {polyOn && uniOn
              ? "Poly + Uni combined"
              : polyOn
              ? "Poly only"
              : "Uni only"}
          </p>
        )}
        {customOn && (
          <div style={{ marginTop: 14 }}>
            <SliderGroup
              label="Custom loan amount"
              value={fmt(customVal)}
              min={5000}
              max={150000}
              step={1000}
              current={customVal}
              onChange={setCustomVal}
              noMargin
            />
          </div>
        )}
      </div>

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
