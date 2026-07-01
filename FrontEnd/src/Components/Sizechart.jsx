
// SizeChart.jsx


import { useState, useEffect } from "react";
import "./Sizechart.css";

const SIZE_DATA = [
  { size: "S",  lengthIn: 25,    widthIn: 14.75 },
  { size: "M",  lengthIn: 25.50, widthIn: 15.75 },
  { size: "L",  lengthIn: 26,    widthIn: 16.75 },
  { size: "XL", lengthIn: 26.50, widthIn: 18.25 },
];

const toCm = (inch) => (inch * 2.54).toFixed(1);

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
                  <th>Length</th>
                  <th>Width</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_DATA.map((row) => (
                  <tr key={row.size}>
                    <td>{row.size}</td>
                    <td>{unit === "in" ? row.lengthIn : toCm(row.lengthIn)}</td>
                    <td>{unit === "in" ? row.widthIn : toCm(row.widthIn)}</td>
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
