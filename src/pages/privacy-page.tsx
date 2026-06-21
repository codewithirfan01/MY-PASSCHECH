import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  FileLock2,
  Fingerprint,
  Hash,
  Layers,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const principles = [
  {
    icon: Hash,
    title: "SHA-1 hashing, client-side",
    body: "Before any breach check, your password is hashed locally in your browser using the SHA-1 algorithm. The unhashed password never leaves your device.",
  },
  {
    icon: Layers,
    title: "K-anonymity range search",
    body: "PassCheck sends only the first 5 characters of the SHA-1 hash to Have I Been Pwned's Pwned Passwords API. The server returns every hash suffix that matches those 5 characters, and we check the remainder locally. The server never sees enough of your hash to identify your password.",
  },
  {
    icon: FileLock2,
    title: "No password storage",
    body: "Your check history records only anonymized result summaries (e.g. \"strong, not breached\"). We do not store the password itself, the full hash, or any portion of it.",
  },
  {
    icon: Fingerprint,
    title: "Email-only lookups",
    body: "Email breach checks query Have I Been Pwned using only your email address. No passwords are sent in that flow. The email is not stored in our database.",
  },
];

export function PrivacyPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 size-4" />
            Back to home
          </Link>
        </Button>

        <div className="mb-8">
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-safe/15">
            <ShieldCheck className="size-6 text-safe" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy & security</h1>
          <p className="mt-3 text-muted-foreground">
            How PassCheck protects your passwords, your email, and your trust.
          </p>
        </div>

        <div className="space-y-4">
          {principles.map((p) => (
            <Card key={p.title} className="glass glass-border">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <p.icon className="size-5 text-electric" />
                </div>
                <div>
                  <h2 className="font-semibold">{p.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass glass-border mt-8">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Eye className="size-5 text-warning" />
              <h2 className="text-lg font-semibold">Academic project notice</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              PassCheck is a student project built for educational purposes. It is not affiliated
              with Have I Been Pwned and does not provide commercial-grade guarantees. While we
              follow industry best practices for password safety, always use a trusted password
              manager for sensitive credentials.
            </p>
            <div className="mt-5 border-t border-border pt-5">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <Mail className="size-4 text-electric" />
                Contact
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Questions or feedback? Reach out at{" "}
                <a
                  href="mailto:passcheck@example.com"
                  className="text-primary hover:underline"
                >
                  passcheck@example.com
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
