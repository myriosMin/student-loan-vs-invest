"use client";

import { useState } from "react";
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
  const [editingCustom, setEditingCustom] = useState(false);
  const [rawInput, setRawInput] = useState("");

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

  function startEdit() {
    setRawInput(String(customVal));
    setEditingCustom(true);
  }

  function commitEdit(raw: string) {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) setCustomVal(parsed);
    setEditingCustom(false);
  }

  return (
    <div className="controls">
      <h2>Assumptions</h2>

      <div className="slider-group">
        <div className="slider-label">
          <span>Loan amount</span>
          {customOn ? (
            editingCustom ? (
              <input
                className="val val-input"
                type="number"
                aria-label="Custom loan amount"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                onBlur={(e) => commitEdit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") setEditingCustom(false);
                }}
                autoFocus
              />
            ) : (
              <button type="button" className="val val-editable" onClick={startEdit}>
                {fmt(loanAmount)}
              </button>
            )
          ) : (
            <span className="val">{fmt(loanAmount)}</span>
          )}
        </div>
        <div className="loan-toggles">
          <button
            type="button"
            className={`loan-toggle${polyOn && !customOn ? " active" : ""}`}
            onClick={handlePolyClick}
          >
            <span className="loan-toggle-check" />
            Poly <span className="loan-toggle-amt">S$24k</span>
          </button>
          <button
            type="button"
            className={`loan-toggle${uniOn && !customOn ? " active" : ""}`}
            onClick={handleUniClick}
          >
            <span className="loan-toggle-check" />
            Uni <span className="loan-toggle-amt">S$32k</span>
          </button>
          <button
            type="button"
            className={`loan-toggle${customOn ? " active" : ""}`}
            onClick={handleCustomClick}
          >
            <span className="loan-toggle-radio" />
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
        {customOn && !editingCustom && (
          <p className="loan-toggle-hint">Tap the amount above to edit</p>
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
