import { useState } from "react";
import { ShieldCheck, ShieldX } from "lucide-react";

import { checkPasswordBreach } from "@/lib/crypto";
import {
  calculateStrength,
  type StrengthResult,
} from "@/lib/password-strength";
import { saveCheckHistory } from "@/lib/history";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

type BreachState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "found"; count: number }
  | { status: "safe" }
  | { status: "error"; message: string };

const levelColor: Record<StrengthResult["level"], string> = {
  weak: "var(--risk)",
  fair: "var(--warning)",
  strong: "var(--electric)",
  "very-strong": "var(--safe)",
};

export function PasswordChecker() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [breach, setBreach] = useState<BreachState>({ status: "idle" });

  const strength = calculateStrength(password);

  const handleCheckBreach = async () => {
    if (!password) {
      toast.error("Enter a password first");
      return;
    }
    setBreach({ status: "checking" });
    try {
      const result = await checkPasswordBreach(password);
      if (result.found) {
        setBreach({ status: "found", count: result.count });
        await saveCheckHistory({
          check_type: "password",
          result_summary: `${strength.label.toLowerCase()}, breached (${result.count.toLocaleString()} occurrences)`,
        });
        toast.error(`Password found in ${result.count.toLocaleString()} breaches`);
      } else {
        setBreach({ status: "safe" });
        await saveCheckHistory({
          check_type: "password",
          result_summary: `${strength.label.toLowerCase()}, not breached`,
        });
        toast.success("Password not found in known breaches");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setBreach({ status: "error", message });
      toast.error("Breach check failed: " + message);
    }
  };

  return (
    <Card className="glass glass-border">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div>
          <label htmlFor="password-input" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Input
              id="password-input"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (breach.status !== "idle") setBreach({ status: "idle" });
              }}
              placeholder="Enter a password to check"
              className="pr-20 font-mono"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Strength meter */}
        {password && (
          <div className="animate-fade-in-up space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Strength</span>
              <span
                className="font-semibold"
                style={{ color: levelColor[strength.level] }}
              >
                {strength.label}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${strength.score}%`,
                  background: levelColor[strength.level],
                }}
              />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span>
                Entropy:{" "}
                <span className="font-medium text-foreground">{strength.entropy} bits</span>
              </span>
              <span>
                Pool size:{" "}
                <span className="font-medium text-foreground">{strength.poolSize}</span>
              </span>
              <span>
                Estimated crack time:{" "}
                <span className="font-medium text-foreground">{strength.crackTime}</span>
              </span>
            </div>
          </div>
        )}

        {/* Check breach button */}
        <Button
          onClick={handleCheckBreach}
          disabled={!password || breach.status === "checking"}
          className="w-full sm:w-auto"
        >
          {breach.status === "checking" ? (
            <Spinner className="mr-2 size-4" />
          ) : (
            <ShieldCheck className="mr-2 size-4" />
          )}
          {breach.status === "checking" ? "Checking..." : "Check Breach Status"}
        </Button>

        {/* Breach result */}
        {breach.status === "found" && (
          <div className="animate-fade-in-up flex items-start gap-3 rounded-lg border border-risk/30 bg-risk/10 p-4">
            <ShieldX className="mt-0.5 size-5 shrink-0 text-risk" />
            <div>
              <p className="font-semibold text-risk">Found in {breach.count.toLocaleString()} breaches</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This password has appeared in known data breaches. We strongly recommend using a
                different password.
              </p>
            </div>
          </div>
        )}

        {breach.status === "safe" && (
          <div className="animate-fade-in-up flex items-start gap-3 rounded-lg border border-safe/30 bg-safe/10 p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-safe" />
            <div>
              <p className="font-semibold text-safe">Not found in known breaches</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This password has not appeared in known public data breaches.
              </p>
            </div>
          </div>
        )}

        {breach.status === "error" && (
          <div className="animate-fade-in-up flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <ShieldX className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Check failed</p>
              <p className="mt-1 text-sm text-muted-foreground">{breach.message}</p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Powered by Have I Been Pwned. Your password is hashed locally with SHA-1 and only the
          first 5 characters are sent — never the full password.
        </p>
      </CardContent>
    </Card>
  );
}
