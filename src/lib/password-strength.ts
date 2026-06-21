export type StrengthLevel = "weak" | "fair" | "strong" | "very-strong";

export interface StrengthResult {
  entropy: number;
  level: StrengthLevel;
  score: number;
  label: string;
  crackTime: string;
  poolSize: number;
}

const CRACK_RATE = 1e10;

function humanizeDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "instantly";
  if (seconds < 1) return "less than a second";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} hours`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)} days`;
  const months = days / 30;
  if (months < 12) return `${Math.round(months)} months`;
  const years = days / 365;
  if (years < 1000) return `${Math.round(years).toLocaleString()} years`;
  if (years < 1e6) return `${Math.round(years / 1000)} thousand years`;
  if (years < 1e9) return `${Math.round(years / 1e6)} million years`;
  return "centuries";
}

function calcPoolSize(password: string): number {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 33;
  return pool;
}

export function calculateStrength(password: string): StrengthResult {
  if (!password) {
    return {
      entropy: 0,
      level: "weak",
      score: 0,
      label: "Empty",
      crackTime: "—",
      poolSize: 0,
    };
  }

  const len = password.length;
  const poolSize = calcPoolSize(password) || 1;
  const entropy = Math.round(len * Math.log2(poolSize));

  let level: StrengthLevel;
  if (entropy < 28) level = "weak";
  else if (entropy < 50) level = "fair";
  else if (entropy < 70) level = "strong";
  else level = "very-strong";

  const scoreMap: Record<StrengthLevel, number> = {
    weak: 25,
    fair: 50,
    strong: 75,
    "very-strong": 100,
  };

  const labelMap: Record<StrengthLevel, string> = {
    weak: "Weak",
    fair: "Fair",
    strong: "Strong",
    "very-strong": "Very Strong",
  };

  const combinations = Math.pow(poolSize, len);
  const seconds = combinations / CRACK_RATE;

  return {
    entropy,
    level,
    score: scoreMap[level],
    label: labelMap[level],
    crackTime: humanizeDuration(seconds),
    poolSize,
  };
}

export function scoreToProgress(score: number): string {
  if (score <= 0) return "0%";
  if (score >= 100) return "100%";
  return `${score}%`;
}
