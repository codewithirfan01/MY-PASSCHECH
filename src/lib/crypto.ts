export async function sha1Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const bytes = Array.from(new Uint8Array(hashBuffer));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export interface BreachResult {
  found: boolean;
  count: number;
}

export async function checkPasswordBreach(password: string): Promise<BreachResult> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  if (!res.ok) {
    throw new Error(`Pwned Passwords API responded ${res.status}`);
  }

  const text = await res.text();
  const lines = text.split("\n");
  for (const line of lines) {
    const [hashSuffix, countStr] = line.trim().split(":");
    if (hashSuffix === suffix) {
      return { found: true, count: parseInt(countStr, 10) || 0 };
    }
  }
  return { found: false, count: 0 };
}
