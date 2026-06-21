import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  EyeOff,
  KeyRound,
  Lock,
  RotateCw,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewsTeaser } from "@/components/reviews-teaser";

const features = [
  {
    icon: KeyRound,
    title: "Password Strength",
    description: "Entropy-based strength scoring with real-time crack time estimates. Know exactly how strong your password really is.",
    accent: "text-electric",
  },
  {
    icon: ShieldCheck,
    title: "Breach Detection",
    description: "Check if your credentials appear in known data breaches using the k-anonymity method — your password never leaves your device.",
    accent: "text-safe",
  },
  {
    icon: RotateCw,
    title: "Secure Generator",
    description: "Generate cryptographically random passwords or memorable passphrases tailored to your site requirements in one click.",
    accent: "text-warning",
  },
];

const trustPoints = [
  "Client-side SHA-1 hashing",
  "K-anonymity breach lookups",
  "No password storage, ever",
  "Free, forever",
];

export function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-6 border-electric/40 text-electric">
            <Sparkles className="mr-1 size-3" />
            Free cybersecurity toolkit
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Check your password security in{" "}
            <span className="text-gradient-electric">seconds</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            PassCheck audits your passwords against known data breaches, scores their real
            entropy, and generates secure replacements — all without your passwords ever leaving
            your browser.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/signup">
                Get started free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-1.5">
                <Shield className="size-4 text-safe" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero preview card */}
        <div className="mx-auto mt-16 max-w-3xl">
          <Card className="glass glass-border overflow-hidden glow-primary">
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Password strength preview
                  </span>
                  <Badge variant="outline" className="border-safe/40 text-safe">
                    Very Strong
                  </Badge>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-input bg-input/30 px-4 py-3 font-mono text-sm">
                  <Lock className="size-4 text-muted-foreground" />
                  <span className="flex-1 tracking-tight">
                    ••••••••••••••••
                  </span>
                  <EyeOff className="size-4 text-muted-foreground" />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-full rounded-full bg-safe animate-pulse-glow" />
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
                    <ShieldCheck className="mx-auto size-5 text-safe" />
                    <p className="mt-1 text-xs text-muted-foreground">Not breached</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
                    <Clock className="mx-auto size-5 text-electric" />
                    <p className="mt-1 text-xs text-muted-foreground">Centuries to crack</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
                    <KeyRound className="mx-auto size-5 text-warning" />
                    <p className="mt-1 text-xs text-muted-foreground">128 bits entropy</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Three tools. One secure workflow.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to audit, protect, and generate credentials — without sending your
            secrets anywhere.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="glass glass-border group transition-transform hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <feature.icon className={`size-10 ${feature.accent}`} />
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Reviews teaser */}
      <ReviewsTeaser />

      {/* Privacy banner */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="glass glass-border overflow-hidden">
          <CardContent className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <Shield className="size-6 text-safe" />
                <h3 className="text-2xl font-semibold">We never store your passwords.</h3>
              </div>
              <p className="mt-3 text-muted-foreground">
                Every password check uses client-side SHA-1 hashing with the k-anonymity method.
                Only the first 5 characters of the hash are sent — never the password, never the
                full hash. Your check history stores only anonymized result summaries.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/privacy">
                Learn how it works
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
