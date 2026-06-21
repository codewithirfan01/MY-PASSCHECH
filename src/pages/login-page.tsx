import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, LogIn, Mail, Shield } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!data.session) {
      toast.error("Email not confirmed yet. Check your inbox.");
      return;
    }

    toast.success("Welcome back");
    navigate(from, { replace: true });
  };

  const handleForgotPassword = async () => {
    const email = form.getValues("email");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter your email first, then click forgot password");
      return;
    }
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });
    setResetting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Reset link sent to your email");
  };

  return (
    <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />

      <Card className="glass glass-border w-full max-w-md glow-primary">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/15">
            <Shield className="size-6 text-electric" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to your PassCheck account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field data-invalid={!!form.formState.errors.email}>
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
                  autoComplete="current-password"
                  placeholder="Your password"
                  className="pl-9"
                  {...form.register("password")}
                />
              </div>
              <FieldError errors={[form.formState.errors.password]} />
            </Field>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetting}
                className="text-xs text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
              >
                {resetting ? "Sending reset link..." : "Forgot password?"}
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 size-4" />
              )}
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
