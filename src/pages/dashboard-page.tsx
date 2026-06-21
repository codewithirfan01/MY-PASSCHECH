import { KeyRound, Mail, RotateCw } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordChecker } from "@/components/dashboard/password-checker";
import { EmailChecker } from "@/components/dashboard/email-checker";
import { PasswordGenerator } from "@/components/dashboard/password-generator";

export function DashboardPage() {
  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Security Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Check your passwords and emails, and generate secure replacements.
          </p>
        </div>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="password">
              <KeyRound className="size-4" />
              <span className="hidden sm:inline">Password</span>
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="size-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="generator">
              <RotateCw className="size-4" />
              <span className="hidden sm:inline">Generator</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="mt-6">
            <PasswordChecker />
          </TabsContent>
          <TabsContent value="email" className="mt-6">
            <EmailChecker />
          </TabsContent>
          <TabsContent value="generator" className="mt-6">
            <PasswordGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
