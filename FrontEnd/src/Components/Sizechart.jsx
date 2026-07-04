// SizeChart.jsx

import { useState, useEffect } from "react";
import "./Sizechart.css";

// Gents shirt size chart — all base values stored in inches (decimal).
// collar / shoulder / height are flat garment measurements.
// chestHalf is the flat half-chest measurement; full chest = chestHalf x 2.
export const SIZE_DATA = [
  { size: "XS",  collar: 14.5, chestHalf: 17, shoulder: 15.5,  height: 26.25 },
  { size: "S",   collar: 15,   chestHalf: 18, shoulder: 16.25, height: 27 },
  { size: "M",   collar: 15.5, chestHalf: 19, shoulder: 17,    height: 27.75 },
  { size: "L",   collar: 16,   chestHalf: 20, shoulder: 17.75, height: 28.5 },
  { size: "XL",  collar: 16.5, chestHalf: 21, shoulder: 18.5,  height: 29.25 },
  { size: "2XL", collar: 17,   chestHalf: 22, shoulder: 19.25, height: 30 },
  { size: "3XL", collar: 17.5, chestHalf: 23, shoulder: 20,    height: 30.75 },
];

export const getRecommendedSizeByChest = (chestInches) => {
  if (typeof chestInches !== 'number' || Number.isNaN(chestInches)) {
    return 'M';
  }

  const distances = SIZE_DATA.map((row) => {
    const fullChest = row.chestHalf * 2;
    return {
      size: row.size,
      distance: Math.abs(fullChest - chestInches),
      chest: fullChest,
    };
  });

  distances.sort((a, b) => a.distance - b.distance);
  return distances[0]?.size || 'M';
};

const toCm = (inch) => (inch * 2.54).toFixed(1);

// Formats a decimal inch value as a whole + quarter fraction string, e.g. 16.25 -> "16 1/4"
const toFraction = (decimal) => {
  const whole = Math.floor(decimal);
  const frac = +(decimal - whole).toFixed(2);
  const fracMap = { 0: "", 0.25: "1/4", 0.5: "1/2", 0.75: "3/4" };
  const keys = Object.keys(fracMap).map(Number);
  const closest = keys.reduce((a, b) => (Math.abs(b - frac) < Math.abs(a - frac) ? b : a));
  const fracStr = fracMap[closest];
  if (!fracStr) return `${whole}`;
  return whole === 0 ? fracStr : `${whole} ${fracStr}`;
};

// Formats a single measurement for display depending on selected unit
const formatValue = (decimal, unit) =>
  unit === "in" ? toFraction(decimal) : toCm(decimal);

export default function SizeChart({ open, onClose }) {
  const [unit, setUnit] = useState("in");

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop - clicks outside close the panel */}
      <div className="sc-overlay" onClick={onClose} />

      {/* Slide-in panel */}
      <div className="sc-modal" role="dialog" aria-modal="true" aria-label="Size Chart">

        {/* Header */}
        <div className="sc-header">
          <span className="sc-brand">Click SuperMall</span>
          <h2 className="sc-title">Size Chart</h2>
          <button className="sc-close" onClick={onClose} aria-label="Close size chart">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="sc-body">

          {/* Size & Fit notes */}
          <div className="sc-fit-section">
            <p className="sc-section-label">Size &amp; Fit</p>
            <ul className="sc-fit-list">
              <li>Your style, perfected — our male model stands 5'10" and wears size L.</li>
              <li>We craft every piece to honour your true size — stay true to your standard fit for a seamless experience.</li>
              <li>Designed with a relaxed silhouette in mind. For an effortlessly oversized look, we recommend sizing up.</li>
              <li>Consult the size chart below to find your ideal fit with confidence.</li>
            </ul>
          </div>

          {/* Measurement table */}
          <div className="sc-table-wrapper">
            <p className="sc-section-label">Measurements</p>

            <div className="sc-unit-toggle">
              <button
                className={`sc-unit-btn ${unit === "in" ? "active" : ""}`}
                onClick={() => setUnit("in")}
              >Inches</button>
              <button
                className={`sc-unit-btn ${unit === "cm" ? "active" : ""}`}
                onClick={() => setUnit("cm")}
              >CM</button>
            </div>

            <table className="sc-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Collar</th>
                  <th>Chest</th>
                  <th>Shoulder</th>
                  <th>Height</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_DATA.map((row) => (
                  <tr key={row.size}>
                    <td>{row.size}</td>
                    <td>{formatValue(row.collar, unit)}</td>
                    <td>
                      {unit === "in"
                        ? `${toFraction(row.chestHalf)} x 2 = ${toFraction(row.chestHalf * 2)}`
                        : `${toCm(row.chestHalf)} x 2 = ${toCm(row.chestHalf * 2)}`}
                    </td>
                    <td>{formatValue(row.shoulder, unit)}</td>
                    <td>{formatValue(row.height, unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="sc-footer">
          <p className="sc-tagline">
            "Your fashion is our first priority — dressed in excellence, always."
          </p>
          <p className="sc-footer-brand">Click SuperMall</p>
        </div>
      </div>
    </>
  );
}