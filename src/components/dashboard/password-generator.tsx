import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Dice5, RefreshCw } from "lucide-react";

import {
  generatePassphrase,
  generatePassword,
} from "@/lib/wordlist";
import { calculateStrength } from "@/lib/password-strength";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const levelColor = {
  weak: "var(--risk)",
  fair: "var(--warning)",
  strong: "var(--electric)",
  "very-strong": "var(--safe)",
} as const;

interface Options {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}

const defaultOptions: Options = {
  length: 16,
  upper: true,
  lower: true,
  numbers: true,
  symbols: true,
};

export function PasswordGenerator() {
  const [passphraseMode, setPassphraseMode] = useState(false);
  const [passphraseWords, setPassphraseWords] = useState(4);
  const [options, setOptions] = useState<Options>(defaultOptions);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    if (passphraseMode) {
      setGenerated(generatePassphrase(passphraseWords, "-"));
    } else {
      setGenerated(
        generatePassword(options.length, {
          upper: options.upper,
          lower: options.lower,
          numbers: options.numbers,
          symbols: options.symbols,
        })
      );
    }
    setCopied(false);
  }, [passphraseMode, passphraseWords, options]);

  useEffect(() => {
    generate();
  }, [generate]);

  const strength = useMemo(() => calculateStrength(generated), [generated]);

  const handleCopy = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      toast.success("Password copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy password");
    }
  };

  const noCharset = !passphraseMode && !options.upper && !options.lower && !options.numbers && !options.symbols;

  return (
    <Card className="glass glass-border">
      <CardContent className="space-y-6 p-6 sm:p-8">
        {/* Passphrase mode toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="passphrase-toggle" className="text-sm font-medium">
              Passphrase mode
            </Label>
            <p className="text-xs text-muted-foreground">
              Generate memorable word-based passwords
            </p>
          </div>
          <Switch
            id="passphrase-toggle"
            checked={passphraseMode}
            onCheckedChange={setPassphraseMode}
          />
        </div>

        {/* Generated password */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              readOnly
              value={generated}
              className="font-mono"
              placeholder="Click generate"
            />
            <Button variant="outline" size="icon" onClick={handleCopy} disabled={!generated} title="Copy to clipboard">
              {copied ? <Check className="size-4 text-safe" /> : <Copy className="size-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={generate} title="Regenerate">
              <RefreshCw className="size-4" />
            </Button>
          </div>

          {/* Live strength meter */}
          {generated && !noCharset && (
            <div className="animate-fade-in space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Strength</span>
                <span className="font-medium" style={{ color: levelColor[strength.level] }}>
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${strength.score}%`,
                    background: levelColor[strength.level],
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ~{strength.crackTime} to crack · {strength.entropy} bits of entropy
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        {passphraseMode ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Number of words</Label>
              <span className="text-sm font-semibold text-primary">{passphraseWords}</span>
            </div>
            <Slider
              value={[passphraseWords]}
              min={2}
              max={8}
              step={1}
              onValueChange={(v) => setPassphraseWords(v[0])}
            />
            <p className="text-xs text-muted-foreground">
              Longer passphrases are easier to remember and harder to crack than complex short
              passwords.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Length</Label>
                <span className="text-sm font-semibold text-primary">{options.length}</span>
              </div>
              <Slider
                value={[options.length]}
                min={6}
                max={64}
                step={1}
                onValueChange={(v) => setOptions((o) => ({ ...o, length: v[0] }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Toggle
                label="Uppercase"
                checked={options.upper}
                onCheckedChange={(v) => setOptions((o) => ({ ...o, upper: v }))}
              />
              <Toggle
                label="Lowercase"
                checked={options.lower}
                onCheckedChange={(v) => setOptions((o) => ({ ...o, lower: v }))}
              />
              <Toggle
                label="Numbers"
                checked={options.numbers}
                onCheckedChange={(v) => setOptions((o) => ({ ...o, numbers: v }))}
              />
              <Toggle
                label="Symbols"
                checked={options.symbols}
                onCheckedChange={(v) => setOptions((o) => ({ ...o, symbols: v }))}
              />
            </div>

            {noCharset && (
              <p className="text-xs text-risk">
                Select at least one character type to generate a password.
              </p>
            )}
          </div>
        )}

        <Button onClick={generate} className="w-full">
          <Dice5 className="mr-2 size-4" />
          Generate new password
        </Button>
      </CardContent>
    </Card>
  );
}

function Toggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5 cursor-pointer">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}
