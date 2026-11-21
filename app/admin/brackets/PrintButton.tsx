"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="scoretag scoretag--purple py-2">
      Print
    </button>
  );
}
