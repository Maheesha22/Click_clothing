import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Home.css";
import { useNavigate } from "react-router-dom";

// ── Men's Dropdown Menu Data ────────────────────────────────────
const MEN_MENU = [
  { label: "Sarong" },
  { label: "Trousers" },
  { label: "Shirts" },
  { label: "T-Shirts" },
  { label: "Shorts" },
  {
    label: "Accessories",
    sub: ["Caps", "Perfume", "Deodorant"],
  },
];

// ── Tab & Sidebar Data ──────────────────────────────────────────
const NAV_TABS = [
  { label: "New Arrivals" },
  { label: "Best Sellers" },
  { label: "Men", menu: MEN_MENU },
  { label: "Gifts" },
  { label: "Men Accessories" },
  { label: "Recently Viewed" },
  { label: "Search History" },
];

const SIDEBAR_LINKS = [
  "categories",
  "New Arrivals",
  "Best Sellers",
  "Men",
  "Accessories",
  "Gifts",
];
