// src/app/page.tsx
"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import NextImage from "next/image";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

/* =========================
   Types
========================= */
type Position = "GK" | "DEF" | "MID" | "ATT" | "Any";
type PosTab = Exclude<Position, "Any">;
type Player = {
  id: string;
  name: string;
  rating: number;
  position: Position;
  realGK?: boolean;     // true goalkeeper
  canPlayGK?: boolean;  // outfielder who can cover GK
};

/* =========================
   Design tokens
========================= */
const HEIGHT = "h-9";

const card =
  "relative rounded-3xl border border-black bg-white shadow-xl p-5 md:p-6";
const sectionTitle = "text-lg md:text-xl font-semibold tracking-tight flex items-center gap-2 mb-3";
const subtle = "text-sm text-neutral-600";

const pillBase =
  `${HEIGHT} rounded-md px-3 text-sm border transition-colors ` +
  "border-black bg-white text-neutral-900 hover:bg-neutral-50";
const pillActive =
  "bg-[#326295] text-white border-[#326295] ring-2";

const input =
  `${HEIGHT} rounded-md px-3 text-sm border border-black ` +
  "bg-white text-neutral-900 outline-none focus:border-emerald-600";

const btnPrimary =
  `${HEIGHT} rounded-md px-4 text-sm font-medium text-white ` +
  "bg-[#326295] hover:bg-[#2b567e] disabled:opacity-50 disabled:cursor-not-allowed";

const btnGhost =
  `${HEIGHT} rounded-md px-4 text-sm font-medium text-neutral-900 ` +
  "border border-black bg-white hover:bg-neutral-50 disabled:opacity-50";

const chip =
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border border-black bg-white text-neutral-900 hover:bg-neutral-50";
const tag =
  "rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-800 border border-black";
const tagHint =
  "rounded-full px-1.5 py-0.5 text-[10px] tracking-wide border " +
  "border-black bg-white text-neutral-700";

const iconBubble =
  "inline-flex items-center justify-center rounded-md bg-white " +
  "border border-black w-7 h-7 text-neutral-700";

/* =========================
   StepHeader
========================= */
function StepHeader({
  icon,
  title,
  subtitle,
  collapsible = false,
  open = true,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="mb-3">
      <div className={`${sectionTitle} justify-between`}>
        <div className="flex items-center gap-2">
          <span className={iconBubble}>{icon}</span>
          <span>{title}</span>
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={onToggle}
            className="ml-3 inline-flex items-center gap-1 rounded-md border border-black bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-neutral-50"
            aria-expanded={open}
            aria-label={open ? "Collapse section" : "Expand section"}
          >
            <span>{open ? "Hide" : "Show"}</span>
            <span aria-hidden>{open ? "▴" : "▾"}</span>
          </button>
        )}
      </div>
      {subtitle ? <p className={subtle}>{subtitle}</p> : null}
    </div>
  );
}

/* =========================
   Data
========================= */
const FORMATS = [
  { label: "5-a-side", size: 5 },
  { label: "7-a-side", size: 7 },
  { label: "8-a-side", size: 8 },
  { label: "11-a-side", size: 11 },
  { label: "Custom", size: null as number | null },
];

// Helper to slugify ids
const idOf = (name: string) => name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

// Your latest list (mapped to our Player shape)
const SAVED: Player[] = [
  { id: idOf("Ed"), name: "Ed", rating: 8, position: "GK", realGK: true },
  { id: idOf("Ant"), name: "Ant", rating: 7, position: "ATT", canPlayGK: true },
  { id: idOf("Stokes"), name: "Stokes", rating: 5.5, position: "DEF", canPlayGK: true },
  { id: idOf("J Burke"), name: "J Burke", rating: 5, position: "DEF", canPlayGK: true },
  { id: idOf("Bell"), name: "Bell", rating: 8, position: "MID" },
  { id: idOf("Ky"), name: "Ky", rating: 9, position: "MID" },
  { id: idOf("Jon C"), name: "Jon C", rating: 7, position: "DEF" },
  { id: idOf("Jord"), name: "Jord", rating: 9, position: "DEF" },
  { id: idOf("Callum"), name: "Callum", rating: 7, position: "DEF" },
  { id: idOf("OB"), name: "OB", rating: 7, position: "MID" },
  { id: idOf("Matts"), name: "Matts", rating: 7, position: "MID" },
  { id: idOf("Kie"), name: "Kie", rating: 7, position: "DEF", canPlayGK: true },
  { id: idOf("Cob"), name: "Cob", rating: 7, position: "MID" },
  { id: idOf("Ross"), name: "Ross", rating: 8, position: "MID" },
  { id: idOf("Mitch"), name: "Mitch", rating: 6.5, position: "MID" },
  { id: idOf("Freddie"), name: "Freddie", rating: 8, position: "ATT" },
  { id: idOf("Owen"), name: "Owen", rating: 9, position: "MID" },
  { id: idOf("Hannon"), name: "Hannon", rating: 6.5, position: "MID" },
  { id: idOf("Matt Field"), name: "Matt Field", rating: 6, position: "ATT" },
  { id: idOf("K-Don"), name: "K-Don", rating: 5.5, position: "MID" },
  { id: idOf("Smithy"), name: "Smithy", rating: 6, position: "ATT" },
  { id: idOf("Beaver"), name: "Beaver", rating: 7, position: "DEF" },
  { id: idOf("Tom Burke"), name: "Tom Burke", rating: 7, position: "MID" },
  { id: idOf("Tom Harris"), name: "Tom Harris", rating: 7, position: "MID" },
  { id: idOf("Graham"), name: "Graham", rating: 6, position: "DEF" },
  { id: idOf("Ize"), name: "Ize", rating: 7, position: "MID" },
  { id: idOf("Belcher"), name: "Belcher", rating: 5, position: "MID" },
  { id: idOf("Matty D"), name: "Matty D", rating: 7, position: "MID" },
  { id: idOf("Salter"), name: "Salter", rating: 4, position: "DEF" },
  { id: idOf("Hextell"), name: "Hextell", rating: 8, position: "MID" },
];

/* =========================
   Math helpers
========================= */
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const variance = (xs: number[]) => {
  const m = mean(xs);
  return xs.length ? xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length : 0;
};
const teamStrength = (t: Player[]) => (t.length ? mean(t.map((p) => p.rating)) : 0);

function shuffle<T>(arr: T[]) {
  // Defensive: if arr is not an array or has 0/1 items, return early
  if (!Array.isArray(arr)) return [];
  if (arr.length <= 1) return [...arr];

  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Variance-minimizing builder: multi-start + greedy seed + hill-climb
function buildBalancedTeams(players: Player[], teamsCount: number, perTeam: number): Player[][] {
  // Guards
  if (!Number.isInteger(teamsCount) || teamsCount < 1) {
    console.warn("buildBalancedTeams: invalid teamsCount", { teamsCount });
    return [];
  }
  if (!Number.isFinite(perTeam) || perTeam < 1) {
    console.warn("buildBalancedTeams: invalid perTeam", { perTeam });
    return [];
  }
  if (!Array.isArray(players) || players.length !== teamsCount * perTeam) {
    console.warn("buildBalancedTeams: players length mismatch", {
      players: Array.isArray(players) ? players.length : players,
      expected: teamsCount * perTeam,
    });
    return [];
  }

  // --- helpers ---
  const cloneTeams = (ts: Player[][]) => ts.map((t) => [...t]);
  const strengthsOf = (ts: Player[][]) => ts.map((t) => teamStrength(t));
  const score = (ts: Player[][]) => variance(strengthsOf(ts));

  // Add a post-optimization "spice" step that biases swaps to lower-rated players.
  function spiceLowRated(ts: Player[][], frac = 0.4, tries = 24, allowFactor = 0.03): Player[][] {
    // frac = bottom fraction of a team we consider "low-rated"
    // allowFactor: accept tiny variance increases up to allowFactor * currentVar + base epsilon
    let best = ts.map(t => [...t]);

    const teamAvg = (t: Player[]) => t.reduce((s, p) => s + p.rating, 0) / (t.length || 1);
    const curVar = () => variance(best.map(teamAvg));

    // pick a random index from the bottom `frac` of a team by rating
    const pickBottomIndex = (t: Player[], fraction: number) => {
      const k = Math.max(1, Math.floor(t.length * fraction));
      const sortedIdx = [...t.keys()].sort((i, j) => t[i].rating - t[j].rating); // low -> high
      const pool = sortedIdx.slice(0, k);
      return pool[Math.floor(Math.random() * pool.length)];
    };

    for (let k = 0; k < tries; k++) {
      // choose two distinct teams
      const a = Math.floor(Math.random() * best.length);
      let b = Math.floor(Math.random() * best.length);
      if (b === a) b = (b + 1) % best.length;

      const ta = best[a];
      const tb = best[b];
      if (!ta.length || !tb.length) continue;

      const ia = pickBottomIndex(ta, frac);
      const ib = pickBottomIndex(tb, frac);

      // keep at least one real GK on teams that currently have one
      const aHasOtherGK = ta.some((x, idx) => idx !== ia && x.realGK);
      const bHasOtherGK = tb.some((x, idx) => idx !== ib && x.realGK);
      if ((ta[ia].realGK && !aHasOtherGK) || (tb[ib].realGK && !bHasOtherGK)) continue;

      // try the swap
      const tmpA = [...ta];
      const tmpB = [...tb];
      [tmpA[ia], tmpB[ib]] = [tmpB[ib], tmpA[ia]];

      const current = curVar();
      const nextVar = variance(
        best.map((t, i) => (i === a ? tmpA : i === b ? tmpB : t)).map(teamAvg)
      );

      const allowIncrease = current * allowFactor + 0.0005; // small base epsilon
      if (nextVar <= current + allowIncrease) {
        best = best.map((t, i) => (i === a ? tmpA : i === b ? tmpB : t));
      }
    }
    return best;
  }

  // Greedy seeding that always places next highest-rated player
  // into the currently weakest team that still has capacity.
  function greedySeed(all: Player[], kTeams: number, size: number): Player[][] {
    const teams: Player[][] = Array.from({ length: kTeams }, () => []);
    const gks = all.filter((p) => p.realGK);
    const others = all.filter((p) => !p.realGK);

    // 1) Try to spread GKs first
    shuffle(gks).forEach((gk, i) => {
      const j = i % kTeams;
      if (teams[j].length < size) teams[j].push(gk);
    });

    // 2) Place remaining players (including any surplus GKs) by rating
    const rest = [...others, ...gks.slice(kTeams)];
    // Bigger noise for lower ratings (so lower-rated players move around more).
    // For r in [1..10], amplitude grows roughly linearly as rating decreases.
    const jitter = (r: number) => (Math.random() - 0.5) * 0.55 * (11 - r);
    const sorted = rest
      .map(p => ({ p, key: p.rating + jitter(p.rating) }))
      .sort((a, b) => b.key - a.key)
      .map(x => x.p);

    for (const p of sorted) {
      // find the weakest team (by average) with available slot
      let bestIdx = -1;
      let bestAvg = Number.POSITIVE_INFINITY;
      for (let t = 0; t < kTeams; t++) {
        if (teams[t].length >= size) continue;
        const avg = teamStrength(teams[t]);
        if (avg < bestAvg) {
          bestAvg = avg;
          bestIdx = t;
        }
      }
      if (bestIdx >= 0) teams[bestIdx].push(p);
    }

    return teams;
  }

  // Local search: try all pairwise swaps to reduce variance while
  // keeping at least one real GK in a team that currently has one.
  function hillClimb(ts: Player[][], size: number, maxIter = 400): Player[][] {
    let teams = cloneTeams(ts);
    let improved = true;
    let guard = 0;
    while (improved && guard++ < maxIter) {
      improved = false;
      const baseVar = score(teams);
      let bestDelta = 0;
      let bestSwap: [number, number, number, number] | null = null;

      for (let a = 0; a < teams.length; a++) {
        for (let b = a + 1; b < teams.length; b++) {
          for (let i = 0; i < teams[a].length; i++) {
            for (let j = 0; j < teams[b].length; j++) {
              const pa = teams[a][i];
              const pb = teams[b][j];

              // Keep a GK if a team currently has one
              const aHasOtherGK = teams[a].some((x, k) => k !== i && x.realGK);
              const bHasOtherGK = teams[b].some((x, k) => k !== j && x.realGK);
              if ((pa.realGK && !aHasOtherGK) || (pb.realGK && !bHasOtherGK)) continue;

              // simulate swap quickly by adjusting strengths
              const Sa = teamStrength(teams[a]);
              const Sb = teamStrength(teams[b]);
              const Sa2 = (Sa * teams[a].length - pa.rating + pb.rating) / teams[a].length;
              const Sb2 = (Sb * teams[b].length - pb.rating + pa.rating) / teams[b].length;

              const strengths = strengthsOf(teams);
              strengths[a] = Sa2;
              strengths[b] = Sb2;

              const newVar = variance(strengths);
              const delta = baseVar - newVar;
              if (delta > bestDelta + 1e-9) {
                bestDelta = delta;
                bestSwap = [a, i, b, j];
              }
            }
          }
        }
      }

      if (bestSwap) {
        const [a, i, b, j] = bestSwap;
        [teams[a][i], teams[b][j]] = [teams[b][j], teams[a][i]];
        improved = true;
      }
    }
    return teams;
  }

  // Multi-start: run several greedy seeds with shuffles and pick the best variance
  const RUNS = Math.min(36, Math.max(12, Math.ceil((teamsCount * perTeam) / 2)));
  let bestTeams: Player[][] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let r = 0; r < RUNS; r++) {
    const shuffled = shuffle(players);
    const seeded = greedySeed(shuffled, teamsCount, perTeam);
    const refined = hillClimb(seeded, perTeam, 160);
    // Spice with a stronger bias toward low-rated churn (faster)
    const spiced = spiceLowRated(refined, 0.35, 16, 0.03);
    const s = score(spiced);
    if (s < bestScore) {
      bestScore = s;
      bestTeams = spiced;
    }
  }

  return bestTeams ?? [];
}

/* =========================
   WhatsApp helpers
========================= */
const generateWhatsAppMessage = (teams: Player[][], bibIdx: number | null) => {
  const lines: string[] = [];
  for (let i = 0; i < teams.length; i++) {
    const prefix = bibIdx === i ? "🎽 " : "";
    lines.push(`${prefix}*Team ${i + 1}*`);
    for (const p of teams[i]) {
      // Only show (GK) for real keepers; do not show position or CanPlayGK in WhatsApp text
      lines.push(p.realGK ? `- ${p.name} (GK)` : `- ${p.name}`);
    }
    lines.push(""); // blank line between teams
  }
  return lines.join("\n").trim();
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers / http contexts
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

/* =========================
   UI helpers - ProgressBar
========================= */

/* =========================
   Thursday forecast (upcoming Thu only)
========================= */
type ThursdayForecast = {
  dateISO: string;
  city?: string;
  tMinC: number | null;
  tMaxC: number | null;
  windMax: number | null; // km/h
  precipProbMax: number | null; // %
  wmoCode: number | null;
  loading: boolean;
  error?: string;
};

const wmoToEmoji = (code: number | null) => {
  if (code === null || code === undefined) return "❓";
  if ([0].includes(code)) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if ([3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([66, 67].includes(code)) return "🌧️❄️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
};

const nextThursdayISO = () => {
  const d = new Date();
  const day = d.getDay(); // Sun=0 ... Thu=4
  const diff = (4 - day + 7) % 7; // 0..6 days until Thu
  const target = new Date(d);
  target.setDate(d.getDate() + (diff === 0 ? 0 : diff)); // if today Thu, use today
  const y = target.getFullYear();
  const m = `${target.getMonth() + 1}`.padStart(2, "0");
  const dd = `${target.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const formatNice = (iso: string) => {
  try {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
  } catch {
    return iso;
  }
};

// Formats the Thursday forecast into a single WhatsApp-friendly line
const forecastLineForWhatsApp = (f: ThursdayForecast, venue: string) => {
  if (!f || !f.dateISO || f.loading) return "";
  const parts: string[] = [];
  const emoji = wmoToEmoji(f.wmoCode ?? null);
  const date = formatNice(f.dateISO);
  if (f.tMaxC != null && f.tMinC != null) parts.push(`${Math.round(f.tMaxC)}°/${Math.round(f.tMinC)}°C`);
  if (f.windMax != null) parts.push(`${Math.round(f.windMax)} km/h wind`);
  if (f.precipProbMax != null) parts.push(`${Math.round(f.precipProbMax)}% rain`);
  const core = parts.join(" · ");
  return `${date} ${emoji}${core ? " · " + core : ""} — 📍 ${venue}`.trim();
};

function ThursdayWeatherBadge({ f }: { f: ThursdayForecast }) {
  const emoji = wmoToEmoji(f.wmoCode ?? null);
  const dateNice = formatNice(f.dateISO);
  const displayCity = (f.city ?? "").replace(/\s*\([^)]*\)\s*$/, "");
  return (
    <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black bg-white/95 px-4 py-2 text-sm text-neutral-900 shadow-sm">
      {displayCity && (
        <>
          <span className="text-base leading-none">📍</span>
          <span className="opacity-90">{displayCity}</span>
          <span className="opacity-50">•</span>
        </>
      )}
      <span className="font-medium">{dateNice}</span>
      {f.tMaxC != null && f.tMinC != null && (
        <>
          <span className="opacity-50">•</span>
          <span className="text-base leading-none">{emoji}</span>
          <span className="opacity-80"> {Math.round(f.tMaxC)}°/{Math.round(f.tMinC)}°C</span>
        </>
      )}
      {f.windMax != null && (
        <>
          <span className="opacity-50">•</span>
          <span className="opacity-80">{Math.round(f.windMax)} km/h</span>
        </>
      )}
      {f.precipProbMax != null && (
        <>
          <span className="opacity-50">•</span>
          <span className="opacity-80">{Math.round(f.precipProbMax)}% rain</span>
        </>
      )}
    </div>
  );
}
function ProgressBar({
  value,
  total,
  size = "md",
  className = "",
  rounded = true,
  showLabel = true,
}: {
  value: number;
  total: number;
  size?: "sm" | "md";
  className?: string;
  rounded?: boolean;
  showLabel?: boolean;
}) {
  const pct = total > 0 ? Math.max(0, Math.min(100, Math.round((value / total) * 100))) : 0;
  const done = pct >= 100;

  const height = size === "sm" ? "h-2" : "h-3.5";
  const radius = rounded ? "rounded-full" : "rounded";

  return (
    <div
      className={`relative w-full border border-black bg-white ${height} ${radius} ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Selection progress"
    >
      <div className={`absolute inset-0 ${radius} overflow-hidden`}>
        <div
          className={`h-full ${radius} bg-[#326295] progress-fill`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-white">
          {value}/{total}
        </div>
      )}
    </div>
  );
}

/* =========================
   Animated Collapse
========================= */
function Collapse({
  open,
  children,
  duration = 220,
  keepMounted = true,
}: {
  open: boolean;
  children: React.ReactNode;
  duration?: number;
  keepMounted?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<string>(open ? "auto" : "0px");
  const [render, setRender] = useState<boolean>(open);

  // Measure and animate between heights
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      setRender(true);
      const h = el.scrollHeight;
      setHeight(h + "px");
      const id = window.setTimeout(() => setHeight("auto"), duration);
      return () => window.clearTimeout(id);
    } else {
      // from auto -> px for graceful collapse
      const h = el.getBoundingClientRect().height;
      setHeight(h + "px");
      // next tick collapse to 0
      const id = window.setTimeout(() => setHeight("0px"), 16);
      // unmount after animation if not keeping
      const id2 = window.setTimeout(() => { if (!keepMounted) setRender(false); }, duration + 20);
      return () => { window.clearTimeout(id); window.clearTimeout(id2); };
    }
  }, [open, duration, keepMounted]);

  // Ensure content is rendered when opening
  useEffect(() => { if (open) setRender(true); }, [open]);

  if (!render && !keepMounted) return null;

  return (
    <div
      style={{ overflow: "hidden", height, transition: `height ${duration}ms ease` }}
      aria-hidden={!open}
    >
      <div ref={ref} className={`transition-opacity ${open ? "opacity-100" : "opacity-0"}`} style={{ transitionDuration: `${duration}ms` }}>
        {children}
      </div>
    </div>
  );
}

/* =========================
   Page
========================= */
export default function Page() {
  // Step 1
  const [formatIdx, setFormatIdx] = useState(2);  // 8-a-side default
  const [customSize, setCustomSize] = useState(7);
  const [numTeams, setNumTeams] = useState(2);
  const [setupConfirmed, setSetupConfirmed] = useState(false);

  // Collapsible state per step
  const [step1Open, setStep1Open] = useState(true);
  const [step2Open, setStep2Open] = useState(true);
  const [step3Open, setStep3Open] = useState(true);

  // Step 2
  const [selected, setSelected] = useState<Player[]>([]);
  const [tab, setTab] = useState<PosTab>("GK");
  const [search, setSearch] = useState("");
  const [playersConfirmed, setPlayersConfirmed] = useState(false);

  // Manual add (collapsed by default)
  const [manualOpen, setManualOpen] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPosition, setManualPosition] = useState<Position>("DEF");
  const [manualRating, setManualRating] = useState<number>(7);

  // Step 3
  const [teams, setTeams] = useState<Player[][]>([]);
  const [bibIdx, setBibIdx] = useState<number | null>(null);
  const [buttonPulse, setButtonPulse] = useState(false);
  // Shuffle animation state
  const [firstGenerationAnimationDone, setFirstGenerationAnimationDone] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  const [extraPlayers, setExtraPlayers] = useState<Player[]>([]);
  // Derived state: pending candidate being flashed (just-clicked)
  const pendingCandidate = useMemo(() => {
    if (!flashId) return undefined;
    const all = [...SAVED, ...extraPlayers];
    return all.find((p) => p.id === flashId);
  }, [flashId, extraPlayers]);

  // Effective count considers the flashing pill that will be added momentarily
  const selectionCountEffective =
    selected.length +
    (pendingCandidate && !selected.some((x) => x.id === pendingCandidate.id) ? 1 : 0);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 3000);
  }, []);


  // Thursday forecast state
  const [thuForecast, setThuForecast] = useState<ThursdayForecast>({
    dateISO: nextThursdayISO(),
    tMinC: null,
    tMaxC: null,
    windMax: null,
    precipProbMax: null,
    wmoCode: null,
    loading: true,
  });


  // Load upcoming Thursday forecast
  const VENUE_NAME = "Sutton United Football Stadium";
  const VENUE_POSTCODE = "B75 7BA";
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // 1) Geocode the venue postcode (B75 7BA) to lat/lon via Postcodes.io (UK)
        const geo = await fetch(
          `https://api.postcodes.io/postcodes/${encodeURIComponent(VENUE_POSTCODE)}`,
          { cache: "no-store" }
        );
        const gj = await geo.json();
        const lat: number | undefined = gj?.result?.latitude;
        const lon: number | undefined = gj?.result?.longitude;

        if (!alive || typeof lat !== "number" || typeof lon !== "number") {
          throw new Error("Could not resolve venue coordinates");
        }

        // 2) Fetch the daily forecast for the upcoming Thursday
        const dateISO = nextThursdayISO();
        const base = "https://api.open-meteo.com/v1/forecast";
        const params = new URLSearchParams({
          latitude: String(lat),
          longitude: String(lon),
          daily:
            "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max",
          timezone: "auto",
          start_date: dateISO,
          end_date: dateISO,
        });

        const res = await fetch(`${base}?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
        const j = await res.json();

        if (!alive) return;
        const idx = 0;
        const daily = j.daily || {};
        const tMax = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max[idx] : null;
        const tMin = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min[idx] : null;
        const code = Array.isArray(daily.weathercode) ? daily.weathercode[idx] : null;
        const precip = Array.isArray(daily.precipitation_probability_max)
          ? daily.precipitation_probability_max[idx]
          : null;
        const wind = Array.isArray(daily.windspeed_10m_max) ? daily.windspeed_10m_max[idx] : null;

        setThuForecast({
          dateISO,
          city: VENUE_NAME,
          tMinC: tMin,
          tMaxC: tMax,
          windMax: wind,
          precipProbMax: precip,
          wmoCode: code,
          loading: false,
        });
      } catch (e) {
        if (!alive) return;
        setThuForecast((prev) => ({
          ...prev,
          loading: false,
          error: e instanceof Error ? e.message : "Failed",
          city: VENUE_NAME,
        }));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* derived */
  const playersPerTeam = useMemo(() => {
    const f = FORMATS[formatIdx];
    const val = f.size ?? Math.max(3, Number.isFinite(customSize) ? customSize : 7);
    return Math.max(1, Math.floor(val));
  }, [formatIdx, customSize]);

  const totalNeeded = useMemo(() => playersPerTeam * numTeams, [playersPerTeam, numTeams]);
  const remaining = totalNeeded - selected.length;

  const available = useMemo(() => {
    const picked = new Set(selected.map((p) => p.id));
    // include any manually-added players
    return [...SAVED, ...extraPlayers].filter((p) => !picked.has(p.id));
  }, [selected, extraPlayers]);
  const addManualPlayer = useCallback(() => {
    const name = manualName.trim();
    if (!name) return;
    const rating = Number.isFinite(manualRating) ? Math.max(1, Math.min(10, Math.round(manualRating * 2) / 2)) : 7;
    const position = manualPosition;
    const newPlayer: Player = {
      id: idOf(name),
      name,
      rating,
      position,
      realGK: position === "GK",
      canPlayGK: false,
    };
    // avoid duplicates by id
    setExtraPlayers((prev) => {
      if (prev.some((p) => p.id === newPlayer.id) || SAVED.some((p) => p.id === newPlayer.id)) {
        return prev.map((p) => (p.id === newPlayer.id ? newPlayer : p));
      }
      return [...prev, newPlayer];
    });
    if (selected.length < totalNeeded && !selected.some((p) => p.id === newPlayer.id)) {
      setSelected((prev) => [...prev, newPlayer]);
    }
    setManualName("");
  }, [manualName, manualRating, manualPosition, selected.length, totalNeeded, selected]);

  const byPos = useMemo(() => {
    const g: Record<Position, Player[]> = { GK: [], DEF: [], MID: [], ATT: [], Any: [] };
    for (const p of available) {
      g[(p.position ?? "Any") as Position].push(p);
    }
    return g;
  }, [available]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return byPos[tab];
    // Search across all available positions when a query is present
    return available.filter((p) => p.name.toLowerCase().includes(s));
  }, [available, byPos, tab, search]);

  const strengths = useMemo(() => teams.map((t) => teamStrength(t)), [teams]);
  const varianceValue = useMemo(() => variance(strengths), [strengths]);

  const whatsappMessage = useMemo(() => {
    if (!teams.length) return "";
    const venue = VENUE_NAME; // use the friendly venue name without postcode
    const forecastLine = forecastLineForWhatsApp(thuForecast, venue);
    const teamsText = generateWhatsAppMessage(teams, bibIdx);
    return forecastLine ? `${teamsText}\n\n*Weather*: ${forecastLine}` : teamsText;
  }, [teams, bibIdx, thuForecast]);

  const step2Locked = teams.length > 0;

  /* actions */
  const toggle = useCallback(
    (p: Player) => {
      const isIn = selected.some((x) => x.id === p.id);
      setPlayersConfirmed(false); // any change invalidates confirmation

      // If already selected, remove immediately
      if (isIn) {
        setSelected((prev) => prev.filter((x) => x.id !== p.id));
        return;
      }

      // Adding: flash green very quickly before moving the pill
      if (remaining <= 0) return;

      // Clear any previous timer
      if (flashTimerRef.current) {
        window.clearTimeout(flashTimerRef.current);
      }

      setFlashId(p.id);
      flashTimerRef.current = window.setTimeout(() => {
        setSelected((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
        setFlashId(null);
      }, 160); // ~0.16s flash
    },
    [selected, remaining]
  );

  const onGenerate = useCallback(() => {
    // If a player is mid-flash (just clicked), include them immediately so
    // you don’t need to press the button twice.
    let pending: Player | undefined;
    if (flashId) {
      const all = [...SAVED, ...extraPlayers];
      pending = all.find((p) => p.id === flashId);
    }
    const sel = pending && !selected.some((x) => x.id === pending!.id) && selected.length < totalNeeded
      ? [...selected, pending!]
      : selected;

    if (!setupConfirmed) return;
    if (!Number.isInteger(numTeams) || numTeams < 1) return;
    if (!Number.isFinite(playersPerTeam) || playersPerTeam < 1) return;
    if (sel.length !== totalNeeded) return;

    if (!firstGenerationAnimationDone) {
      setIsShuffling(true);
      const built = buildBalancedTeams(sel, numTeams, playersPerTeam);
      setIsShuffling(false);
      if (!built.length) return;
      setTeams(built);
      setButtonPulse(true);
      setTimeout(() => setButtonPulse(false), 350);
      if (bibIdx === null) setBibIdx(Math.floor(Math.random() * built.length));
      setPlayersConfirmed(true);
      setStep2Open(false);
      setStep3Open(true);
      setFirstGenerationAnimationDone(true);
      setTimeout(() => {
        document.getElementById("step-3")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return;
    }

    const built = buildBalancedTeams(sel, numTeams, playersPerTeam);
    if (!built.length) return;
    setTeams(built);
    setButtonPulse(true);
    setTimeout(() => setButtonPulse(false), 500);
    if (bibIdx === null) setBibIdx(Math.floor(Math.random() * built.length));
    setPlayersConfirmed(true);
    setStep2Open(false);
    setStep3Open(true);
    setTimeout(() => {
      document.getElementById("step-3")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [setupConfirmed, selected, totalNeeded, numTeams, playersPerTeam, bibIdx, firstGenerationAnimationDone, flashId, extraPlayers]);

  const onAmendPlayers = useCallback(() => {
    // Keep current selection, just unlock Step 2 and scroll to it
    setTeams([]);
    setBibIdx(null);
    setPlayersConfirmed(false);
    // Smooth scroll back to Step 2
    setTimeout(() => {
      document.getElementById("step-2")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  /* UI helpers */
  const SegPill = ({
    active,
    children,
    onClick,
    className = "",
    ariaPressed,
    disabled,
  }: {
    active?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    ariaPressed?: boolean;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed ?? active}
      data-active={active ? "true" : "false"}
      className={`${pillBase} segpill ${active ? pillActive : ""} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled}
    >
      {children}
    </button>
  );

  // PlayerPill component (supports compact mode for smaller, centered pills)
  const PlayerPill = ({
    p,
    onClick,
    onRemove,
    disabled = false,
    removable = false,
    showPositionTag = true,
    compact = false,
    flash = false,
  }: {
    p: Player;
    onClick: () => void;
    onRemove?: () => void;
    disabled?: boolean;
    removable?: boolean;
    showPositionTag?: boolean;
    compact?: boolean;
    flash?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative group border border-black bg-white shadow-sm transition hover:shadow-md disabled:opacity-50 ${disabled ? "cursor-not-allowed" : ""} ${compact ? "w-full rounded-md px-10 py-2 text-[14px] text-center" : "w-auto min-w-[160px] rounded-lg px-3 py-2"} ${flash ? "flash-green" : ""}`}
      title={p.realGK ? "Goalkeeper" : p.canPlayGK ? "Can play GK" : p.position}
    >
      {compact ? (
        // Compact layout: centered name, smaller text
        <>
          <div className="flex items-center justify-center">
            <div className="font-medium text-neutral-900 truncate text-[13px]">
              {p.name || p.id || "Player"}
              {!p.realGK && p.canPlayGK && (
                <sup className="ml-0.5 text-neutral-400" title="Can play GK">*</sup>
              )}
            </div>
          </div>
          {removable && (
            <span
              onClick={(e) => { e.stopPropagation(); onRemove ? onRemove() : onClick(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-black bg-neutral-100 text-[12px] leading-none hover:bg-neutral-200"
              title="Remove"
            >
              ✕
            </span>
          )}
        </>
      ) : (
        // Default layout: name on left, optional tags on right
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 font-medium text-neutral-900 truncate">
            {p.name || p.id || "Player"}
            {!p.realGK && p.canPlayGK && (
              <sup className="ml-0.5 text-neutral-400" title="Can play GK">*</sup>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {p.realGK && showPositionTag && <span className={tag}>GK</span>}
            {!p.realGK && showPositionTag && <span className={tag}>{p.position}</span>}
            {removable && (
              <span
                onClick={(e) => { e.stopPropagation(); onRemove ? onRemove() : onClick(); }}
                className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-black bg-neutral-100 text-[10px] leading-none hover:bg-neutral-200"
                title="Remove"
              >
                ✕
              </span>
            )}
          </div>
        </div>
      )}
    </button>
  );

  return (
    <main className={`${inter.className} relative mx-auto max-w-4xl px-4 py-6 text-neutral-900 bg-[#326295] min-h-screen`}>
      {/* Header */}
      <header className="mb-6 text-center text-white">
        <div className="flex items-center justify-center gap-3">
          <NextImage
            src="/fofa-logo.png"
            alt="FOFA"
            width={44}
            height={44}
            priority
            className="rounded-full"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Team Generator</h1>
        </div>
        <p className="mt-1 text-white">Up the FOFA!</p>
        {/* Venue Thursday forecast only */}
        <div className="mt-3 flex flex-col items-center gap-2">
          {thuForecast.loading ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-black bg-white/95 px-4 py-2 text-sm text-neutral-900 shadow-sm">
              <span className="text-base leading-none">🌤️</span>
              <span className="font-semibold">{thuForecast.city ?? VENUE_NAME}</span>
              <span className="opacity-50">•</span>
              <span className="font-medium">{formatNice(thuForecast.dateISO)}</span>
              <span className="opacity-60"> • fetching…</span>
            </div>
          ) : (
            <ThursdayWeatherBadge f={thuForecast} />
          )}
        </div>
      </header>

      {/* STEP 1 */}
      <section className={`${card} ${setupConfirmed ? "opacity-70" : ""}`}>
        <StepHeader
          icon={<span>⚙️</span>}
          title="Step 1 · Match setup"
          subtitle={
            setupConfirmed
              ? "Setup is locked. Click Change to edit."
              : "Choose the match format and number of teams, then confirm."
          }
          collapsible={setupConfirmed}
          open={step1Open}
          onToggle={() => setStep1Open((v) => !v)}
        />

        <Collapse open={!setupConfirmed || step1Open}>
          <>
            <div className="relative" aria-disabled={setupConfirmed}>
              {setupConfirmed && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-white/40"
                />
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr,260px] md:items-end transition-opacity">
                {/* formats */}
                <div>
                  <div className="mb-2 text-sm text-neutral-700">Match format</div>
                  <div className="flex flex-wrap gap-2">
                    {FORMATS.map((f, i) => (
                      <SegPill
                        key={f.label}
                        active={i === formatIdx}
                        onClick={() => {
                          setFormatIdx(i);
                          setSetupConfirmed(false);
                          setStep1Open(true);
                        }}
                        ariaPressed={i === formatIdx}
                        disabled={setupConfirmed}
                      >
                        {f.label}
                      </SegPill>
                    ))}
                    {FORMATS[formatIdx].size === null && (
                      <input
                        type="number"
                        min={3}
                        value={customSize}
                        onChange={(e) => {
                          setCustomSize(Math.max(3, Number(e.target.value || 7)));
                          setSetupConfirmed(false);
                          setStep1Open(true);
                        }}
                        className={`${input} w-24`}
                        disabled={setupConfirmed}
                      />
                    )}
                  </div>
                </div>

                {/* right: number of teams + confirm */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <div className="mb-2 text-sm text-neutral-700">Number of teams</div>
                    <div className="flex gap-2">
                      {[2, 4, 6].map((n) => (
                        <SegPill
                          key={n}
                          active={numTeams === n}
                          onClick={() => {
                            setNumTeams(n);
                            setSetupConfirmed(false);
                            setStep1Open(true);
                          }}
                          ariaPressed={numTeams === n}
                          className="w-14 justify-center"
                          disabled={setupConfirmed}
                        >
                          {n}
                        </SegPill>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky confirm bar inside the card */}
            <div className="mt-6 flex items-center gap-3">
              {!setupConfirmed ? (
                <button
                  onClick={() => {
                    setSetupConfirmed(true);
                    setStep1Open(false); // auto-collapse
                  }}
                  className={btnPrimary}
                >
                  Confirm setup
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span
                    role="status"
                    aria-live="polite"
                    className="inline-flex items-center gap-2 rounded-md border border-[#326295] bg-[#326295] px-3 py-2 text-sm font-medium text-white"
                    title="Setup is locked"
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20"
                    >
                      ✓
                    </span>
                    Setup confirmed
                  </span>
                  <button
                    onClick={() => {
                      setSetupConfirmed(false);
                      setStep1Open(true);
                    }}
                    className="text-sm font-medium text-[#326295] underline-offset-2 hover:underline"
                    title="Make changes"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </>
        </Collapse>
      </section>

      {/* STEP 2 (gated by setupConfirmed) */}
      {setupConfirmed && (
        <section id="step-2" className={`${card} mt-5 ${step2Locked ? "opacity-70" : ""}`}>
          <StepHeader
            icon={<span>👥</span>}
            title="Step 2 · Add players"
            subtitle={step2Locked ? "Selection is locked. Use the Regenerate button in Results to remix teams." : "Select players for this session. Filter by position and search."}
            collapsible={playersConfirmed || step2Locked}
            open={step2Open}
            onToggle={() => setStep2Open((v) => !v)}
          />
          <Collapse open={!playersConfirmed || step2Open}>
            <>
              <div className="mb-3 text-sm">
                Players needed: <b>{totalNeeded}</b> · Selected: <b>{selected.length}</b> · Remaining:{" "}
                <b>{Math.max(0, remaining)}</b>
              </div>
              <ProgressBar value={selected.length} total={totalNeeded} className="mb-3" showLabel={false} />

              {/* Segmented tabs + search */}
              <div className="mb-3 flex flex-wrap items-center gap-2" aria-disabled={step2Locked}>
                {(["GK", "DEF", "MID", "ATT"] as PosTab[]).map((p) => {
                  const selectedPill = tab === p;
                  const counts: Record<PosTab, number> = {
                    GK: available.filter((x) => x.position === "GK").length,
                    DEF: available.filter((x) => x.position === "DEF").length,
                    MID: available.filter((x) => x.position === "MID").length,
                    ATT: available.filter((x) => x.position === "ATT").length,
                  };
                  const count = counts[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { if (!step2Locked) setTab(p); }}
                      aria-pressed={selectedPill}
                      className={`flex items-center gap-1 px-4 py-2 rounded-md border transition-colors
${selectedPill ? 'bg-[#326295] border-[#326295] text-white font-semibold' : 'bg-white border-gray-300 text-gray-800'} disabled:opacity-50 disabled:cursor-not-allowed
`}
                      disabled={step2Locked}
                    >
                      <span>
                        <span className="text-sm">{p}</span>{" "}
                        <span className={`text-sm ${selectedPill ? 'opacity-90' : 'text-gray-500'}`}>({count})</span>
                      </span>
                    </button>
                  );
                })}

                <div className="ml-auto">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className={`${input} w-40`}
                    disabled={step2Locked}
                  />
                </div>
              </div>

              {/* Candidates */}
              <div className="rounded-lg border border-black bg-white p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {(() => {
                    const s = search.trim().toLowerCase();
                    // If searching, ignore the tab and search across ALL available players
                    const base = s
                      ? available
                      : tab === "GK"
                      ? available.filter((p) => p.position === "GK")
                      : tab === "DEF"
                      ? available.filter((p) => p.position === "DEF")
                      : tab === "MID"
                      ? available.filter((p) => p.position === "MID")
                      : available.filter((p) => p.position === "ATT");

                    const inView = s ? base.filter((p) => p.name.toLowerCase().includes(s)) : base;

                    if (inView.length === 0)
                      return <span className="text-sm text-neutral-500">No players in this group.</span>;

                    return inView.map((p) => {
                      const disabled = remaining <= 0;
                      return (
                        <PlayerPill
                          key={p.id}
                          p={p}
                          disabled={step2Locked || disabled}
                          onClick={() => { if (!step2Locked) toggle(p); }}
                          showPositionTag={false}
                          compact
                          flash={flashId === p.id}
                        />
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Manual add (expandable) */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => !step2Locked && setManualOpen(v => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={step2Locked}
                >
                  <span className="inline-block -translate-y-[1px]">{manualOpen ? "▾" : "▸"}</span>
                  Add player manually
                </button>

                {manualOpen && (
                  <div className="mt-2 rounded-lg border border-black bg-white p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="Name"
                        className={`${input} w-[260px]`}
                        disabled={step2Locked}
                      />
                      <select
                        value={manualPosition}
                        onChange={(e) => setManualPosition(e.target.value as Position)}
                        className={`${input} w-24`}
                        disabled={step2Locked}
                      >
                        <option value="GK">GK</option>
                        <option value="DEF">DEF</option>
                        <option value="MID">MID</option>
                        <option value="ATT">ATT</option>
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        step={0.5}
                        value={manualRating}
                        onChange={(e) => setManualRating(Number(e.target.value))}
                        className={`${input} w-20`}
                        disabled={step2Locked}
                      />
                      <button
                        type="button"
                        onClick={addManualPlayer}
                        className={btnPrimary}
                        disabled={step2Locked || !manualName.trim()}
                        title={!manualName.trim() ? "Enter a name first" : "Add player"}
                      >
                        Add player
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected */}
              <div className="mt-4">
                <div className="mb-2 text-sm text-neutral-700">Selected</div>
                <div className="rounded-lg border border-black bg-white p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {selected.length === 0 && (
                      <span className="text-sm text-neutral-500">No players selected.</span>
                    )}
                    {selected.map((p) => (
                      <PlayerPill
                        key={p.id}
                        p={p}
                        onClick={() => { if (!step2Locked) toggle(p); }}
                        onRemove={() => { if (!step2Locked) toggle(p); }}
                        removable
                        showPositionTag={false}
                        compact
                        disabled={step2Locked}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirm & Generate */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!step2Locked ? (
                  <>
                    <button
                      className={`${btnPrimary} ${buttonPulse ? "pulse-success" : ""}`}
                      onClick={onGenerate}
                      disabled={selectionCountEffective !== totalNeeded}
                      title={
                        selectionCountEffective !== totalNeeded
                          ? "Select exactly the required number of players"
                          : "Confirm and build teams"
                      }
                    >
                      Confirm & Generate teams
                    </button>
                    <button
                      className={btnGhost}
                      onClick={() => {
                        setSelected([]);
                        setTeams([]);
                        setBibIdx(null);
                      }}
                    >
                      Clear selection
                    </button>
                  </>
                ) : (
                  <div className="text-sm text-neutral-700">Step 2 is locked. Use <b>Regenerate teams</b> in Step 3 to remix without editing the selection.</div>
                )}
              </div>
            </>
          </Collapse>
        </section>
      )}

      {/* STEP 3 (gated by setupConfirmed) */}
      {setupConfirmed && (
        <section id="step-3" className={`${card} mt-5`}>
          <StepHeader
            icon={<span>🎯</span>}
            title="Step 3 · Results"
            subtitle="Team averages and variance update on every generate."
            collapsible={teams.length > 0}
            open={step3Open}
            onToggle={() => setStep3Open((v) => !v)}
          />

          {teams.length === 0 ? (
            <p className="text-sm text-white">Generate teams in Step 2 to see results here.</p>
          ) : (
            <Collapse open={step3Open}>
              <>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {teams.map((t, i) => (
                    <div
                      key={`m-${i}`}
                    className="rounded-md border border-black bg-white p-3"
                    >
                      <div className="text-xs text-neutral-400">Team {i + 1} Avg</div>
                      <div className="text-lg font-semibold">{teamStrength(t).toFixed(2)}</div>
                    </div>
                  ))}
                  <div className="rounded-md border border-black bg-white p-3">
                    <div className="text-xs text-neutral-400">Variance</div>
                    <div className="text-lg font-semibold">{varianceValue.toFixed(4)}</div>
                  </div>
                </div>

                {/* Teams */}
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {teams.map((team, ti) => (
                    <div key={`t-${ti}`} className="rounded-md border border-black bg-white p-3">
                      <div className="mb-2 text-base font-semibold text-center">
                        {bibIdx === ti ? "🎽 " : ""}
                        Team {ti + 1}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 justify-items-stretch">
                        {team.map((player, pi) => (
                          <div
                            key={player.id ?? `${player.name}-${pi}`}
                            className={`player-chip fade-in ${isShuffling ? "shuffle-animation" : ""}`}
                            style={{ ["--d" as any]: `${ti * 120 + pi * 40}ms` }}
                          >
                            {player.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {teams.length > 0 && (
                  <div className="mt-3 w-full flex items-center gap-2 justify-start">
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={onAmendPlayers}
                      title="Unlock Step 2 and adjust the selected players"
                    >
                      Amend players
                    </button>
                    <button
                      type="button"
                      className={btnPrimary}
                      onClick={onGenerate}
                      title="Rebuild teams with the same selected players"
                    >
                      Regenerate teams
                    </button>
                  </div>
                )}

                {/* WhatsApp */}
                <div className="mt-5 rounded-xl border border-black bg-white p-4">
                  <div className="mb-2 text-sm font-medium text-neutral-900">📲 WhatsApp message</div>
                  <textarea
                    readOnly
                    className="w-full rounded-md border border-black bg-white p-3 text-sm text-neutral-900"
                    rows={8}
                    value={whatsappMessage}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className={btnPrimary}
                      onClick={async () => {
                        const ok = await copyToClipboard(whatsappMessage);
                        showToast(ok ? "Copied to clipboard" : "Copy failed. Please copy manually.");
                      }}
                    >
                      Copy to clipboard
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
                      target="_blank"
                      className={`${btnGhost} inline-flex items-center`}
                    >
                      Open WhatsApp
                    </a>
                  </div>
                </div>
              </>
            </Collapse>
          )}
        </section>
      )}

      {/* Reset all */}
      <div className="mt-5">
        <button
          className={btnGhost}
          onClick={() => {
            setSelected([]);
            setTeams([]);
            setBibIdx(null);
            setSetupConfirmed(false);
            setPlayersConfirmed(false);
            setFirstGenerationAnimationDone(false);
          }}
        >
          Reset all
        </button>
      </div>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md border border-black bg-white/95 px-4 py-2 text-sm font-medium text-neutral-900 shadow-lg">
          {toast}
        </div>
      )}
      {/* Force-selected pill style as a safety net (CSS, not Tailwind, to win specificity/caching) */}
      <style jsx global>{`
        @keyframes flashGreen {
          0% { background-color: #059669; color: #ffffff; transform: scale(1.02); }
          100% { background-color: #ffffff; color: #111827; transform: scale(1); }
        }
        .flash-green {
          animation: flashGreen 160ms ease-out;
        }
        /* Shuffle animation for player pills */
        .shuffle-animation {
          animation: shufflePlayers 1.2s ease-in-out;
        }
        @keyframes shufflePlayers {
          0% { transform: translate(0, 0); opacity: 1; }
          20% { transform: translate(10px, -10px); opacity: 0.7; }
          40% { transform: translate(-10px, 5px); opacity: 0.8; }
          60% { transform: translate(5px, -5px); opacity: 0.7; }
          80% { transform: translate(-5px, 10px); opacity: 0.9; }
          100% { transform: translate(0, 0); opacity: 1; }
        }
        /* Player pill basic style for Step 3 */
        .player-pill {
          display: inline-block;
          margin: 2px 4px 2px 0;
          padding: 5px 12px;
          border-radius: 16px;
          border: 1px solid #326295;
          background: #f3f6fa;
          color: #1d3557;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.18s, color 0.18s;
        }
        /* Uniform grid chip for Step 3 */
        .player-chip {
          display: block;
          width: 100%;
          text-align: center;
          padding: 8px 12px;
          min-height: 40px;
          line-height: 24px;
          border-radius: 12px;
          border: 1px solid #326295;
          background: #f3f6fa;
          color: #1d3557;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.18s, color 0.18s;
        }
        /* Force selected state for our segmented pills (Step 1 + any SegPill usage) */
        .segpill[data-active="true"] {
          background-color: #326295 !important;
          color: #ffffff !important;
          border-color: #326295 !important;
          box-shadow: 0 0 0 2px rgba(50, 98, 149, 0.3);
        }
        .segpill[data-active="true"]:hover {
          background-color: #2b567e !important;
          border-color: #2b567e !important;
        }
        /* Success pulse for confirm button */
        @keyframes pulseSuccess {
          0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(50,98,149,0.6); }
          60%  { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(50,98,149,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(50,98,149,0); }
        }
        .pulse-success {
          animation: pulseSuccess 500ms ease-out;
        }
        /* Weather badge tweaks on blue bg */
        .dark-on-blue {
          color: #111827;
        }
        .transition-opacity { transition-property: opacity; }
        /* Smooth progress bar width animation */
        .progress-fill {
          transition: width 450ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: width;
        }
        @media (prefers-reduced-motion: reduce) {
          .progress-fill {
            transition: none;
          }
        }
        /* Fade-in (staggerable via --d) */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeInUp 0.28s ease-out both;
          animation-delay: var(--d, 0ms);
        }
      `}</style>
    </main>
  );
}