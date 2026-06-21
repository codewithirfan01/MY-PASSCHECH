import { useState } from "react";
import { Info, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import { z } from "zod";

import { saveCheckHistory } from "@/lib/history";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const emailSchema = z.string().email("Enter a valid email address");

type BreachInfo = {
  name: string;
  domain: string;
  date: string;
  count: string;
  dataClasses: string[];
};

interface BreachRecord {
  Name: string;
  Domain: string;
  BreachDate: string;
  PwnCount: number;
  DataClasses: string[];
}

type CheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "found"; breaches: BreachInfo[]; email: string }
  | { status: "safe"; email: string }
  | { status: "error"; message: string };

export function EmailChecker() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<CheckState>({ status: "idle" });

  const handleCheck = async () => {
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const cleanedEmail = parsed.data;
    setState({ status: "checking" });

    try {
      const { data, error } = await supabase.functions.invoke("email-breach-check", {
        body: { email: cleanedEmail },
      });

      if (error) {
        throw new Error(error.message);
      }

      const breaches: BreachInfo[] = (data?.breaches ?? []).map((b: BreachRecord) => ({
        name: b.Name,
        domain: b.Domain,
        date: b.BreachDate,
        count: b.PwnCount.toLocaleString(),
        dataClasses: b.DataClasses,
      }));

      if (breaches.length > 0) {
        setState({ status: "found", breaches, email: cleanedEmail });
        await saveCheckHistory({
          check_type: "email",
          result_summary: `${breaches.length} breach(es) found`,
        });
        toast.error(`Email found in ${breaches.length} breach(es)`);
      } else {
        setState({ status: "safe", email: cleanedEmail });
        await saveCheckHistory({
          check_type: "email",
          result_summary: "no breaches found",
        });
        toast.success("Email not found in known breaches");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setState({ status: "error", message });
      toast.error("Email check failed: " + message);
    }
  };

  return (
    <Card className="glass glass-border">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div>
          <label htmlFor="email-input" className="mb-2 block text-sm font-medium">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state.status !== "idle") setState({ status: "idle" });
              }}
              placeholder="you@example.com"
              className="pl-9"
              autoComplete="email"
            />
          </div>
        </div>

        <Button onClick={handleCheck} disabled={state.status === "checking"} className="w-full sm:w-auto">
          {state.status === "checking" ? (
            <Spinner className="mr-2 size-4" />
          ) : (
            <ShieldAlert className="mr-2 size-4" />
          )}
          {state.status === "checking" ? "Checking..." : "Check Email Breaches"}
        </Button>

        {state.status === "found" && (
          <div className="animate-fade-in-up space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-risk/30 bg-risk/10 p-4">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-risk" />
              <div>
                <p className="font-semibold text-risk">
                  Found in {state.breaches.length} known breach(es)
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Change your password on any affected services immediately.
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {state.breaches.map((b) => (
                <li
                  key={b.name}
                  className="rounded-lg border border-border bg-card/40 p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">{b.name}</p>
                    <span className="text-xs text-muted-foreground">{b.date}</span>
                  </div>
                  {b.domain && (
                    <p className="text-xs text-muted-foreground">{b.domain}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {b.count} accounts affected
                  </p>
                  {b.dataClasses.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Compromised data: {b.dataClasses.join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {state.status === "safe" && (
          <div className="animate-fade-in-up flex items-start gap-3 rounded-lg border border-safe/30 bg-safe/10 p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-safe" />
            <div>
              <p className="font-semibold text-safe">Not found in known breaches</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This email does not appear in known public breach records.
              </p>
            </div>
          </div>
        )}

        {state.status === "error" && (
          <div className="animate-fade-in-up flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Check failed</p>
              <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            This checks your email against Have I Been Pwned&apos;s breach database via a serverless
            function. Only your email address is used for the lookup.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
