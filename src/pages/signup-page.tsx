import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, Lock, Mail, Shield } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { calculateStrength } from "@/lib/password-strength";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";

const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

export function SignupPage() {
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const strength = calculateStrength(password);

  const onSubmit = async (values: SignupValues) => {
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session) {
      toast.success("Account created successfully");
      navigate("/dashboard");
      return;
    }

    setEmailSent(true);
    toast.success("Check your email to confirm your account");
  };

  if (emailSent) {
    return (
      <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        <Card className="glass glass-border w-full max-w-md glow-safe">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-safe/15">
              <CheckCircle2 className="size-7 text-safe" />
            </div>
            <h2 className="text-2xl font-semibold">Verify your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to your inbox. Click it to activate your account, then
              sign in.
            </p>
            <Button className="mt-6 w-full" asChild>
              <Link to="/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />

      <Card className="glass glass-border w-full max-w-md glow-primary">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/15">
            <Shield className="size-6 text-electric" />
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Start securing your passwords in seconds
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field
              data-invalid={!!form.formState.errors.email}
            >
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  {...form.register("email")}
                />
              </div>
              <FieldError errors={[form.formState.errors.email]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="pl-9"
                  {...form.register("password", {
                    onChange: (e) => setPassword(e.target.value),
                  })}
                />
              </div>
              {password && (
                <div className="animate-fade-in space-y-1 pt-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${strength.score}%`,
                        background:
                          strength.level === "weak"
                            ? "var(--risk)"
                            : strength.level === "fair"
                              ? "var(--warning)"
                              : "var(--safe)",
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {strength.label} · ~{strength.crackTime} to crack
                  </p>
                </div>
              )}
              <FieldError errors={[form.formState.errors.password]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="pl-9"
                  {...form.register("confirmPassword")}
                />
              </div>
              <FieldError errors={[form.formState.errors.confirmPassword]} />
            </Field>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Shield className="mr-2 size-4" />
              )}
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
