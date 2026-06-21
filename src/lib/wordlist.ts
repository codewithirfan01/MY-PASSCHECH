const WORDS = [
  "apple", "brave", "cloud", "dance", "eagle", "flame", "grape", "heart",
  "ivory", "jelly", "knee", "lemon", "mango", "north", "ocean", "piano",
  "queen", "river", "stone", "tiger", "umbra", "vivid", "whale", "xenon",
  "yacht", "zebra", "arrow", "bread", "camel", "delta", "earth", "frost",
  "globe", "honey", "image", "joker", "knife", "lunar", "metal", "noble",
  "opera", "peach", "quiet", "royal", "silver", "trunk", "urban", "vapor",
  "wagon", "youth", "amber", "basil", "coral", "daisy", "ember", "fenix",
  "glide", "haven", "inferno", "jade", "karma", "lotus", "maple", "nebula",
  "onyx", "pearl", "quartz", "ruby", "sage", "thorn", "unity", "vortex",
  "willow", "xander", "yarrow", "zephyr", "atlas", "birch", "cedar", "dune",
  "fjord", "grove", "hill", "isle", "jewel", "knot", "lake", "meadow",
  "nest", "oak", "peak", "ridge", "summit", "tide", "vale", "wave",
  "breeze", "canyon", "dawn", "dusk", "echo", "field", "forge", "gale",
  "harbor", "marsh", "plain", "storm", "trail", "valley", "creek", "cliff",
  "crown", "crystal", "falcon", "raven", "sparrow", "heron", "lynx", "puma",
  "wolf", "fox", "bear", "deer", "owl", "hawk", "seal", "otter", "buffalo",
  "bison", "moose", "carp", "trout", "salmon", "tuna", "drift", "spark",
  "blaze", "frost", "shade", "light", "beacon", "torch", "lantern", "prism",
  "mirror", "shadow", "quill", "scroll", "tome", "novel", "poem", "verse",
  "chord", "hymn", "anthem", "ballad", "rhythm", "tempo", "cadence", "echo",
  "velvet", "satin", "linen", "cotton", "flannel", "denim", "leather", "silk",
  "azure", "ivory", "scarlet", "indigo", "violet", "amber", "copper", "jade",
  "garnet", "marble", "granite", "slate", "quartz", "obsidian", "bronze",
  "nickel", "sterling", "mercury", "neon", "argon", "helium", "lithium",
  "compass", "anchor", "vessel", "harbor", "voyage", "sail", "oar", "mast",
  "rudder", "ladder", "bridge", "tunnel", "arch", "pillar", "column",
  "tower", "castle", "temple", "shrine", "abbey", "manor", "villa",
  "cottage", "cabin", "tent", "lodge", "inn", "haven", "retreat", "asylum",
  "cipher", "matrix", "vector", "tensor", "scalar", "binary", "digit",
  "quantum", "photon", "electron", "neutron", "proton", "fusion", "fission",
  "orbit", "galaxy", "comet", "asteroid", "meteor", "planet", "cosmos",
];

export function generatePassphrase(wordCount: number = 4, separator: string = "-"): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const idx = Math.floor(Math.random() * WORDS.length);
    words.push(WORDS[idx]);
  }
  const num = Math.floor(Math.random() * 100);
  return [...words, String(num)].join(separator);
}

export function generatePassword(
  length: number,
  options: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }
): string {
  const pools: string[] = [];
  if (options.lower) pools.push("abcdefghijklmnopqrstuvwxyz");
  if (options.upper) pools.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (options.numbers) pools.push("0123456789");
  if (options.symbols) pools.push("!@#$%^&*()_+-=[]{}|;:,.<>?");

  if (pools.length === 0) return "";

  const all = pools.join("");
  const len = Math.max(1, length);
  let result = "";

  const randomValues = new Uint32Array(len);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < len; i++) {
    result += all[randomValues[i] % all.length];
  }

  let chars = result.split("");
  pools.forEach((pool) => {
    const randomIdx = Math.floor(Math.random() * chars.length);
    const randomCharIdx = Math.floor(Math.random() * pool.length);
    chars[randomIdx] = pool[randomCharIdx];
  });

  return chars.join("");
}
