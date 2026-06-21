import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  LogOut,
  Mail,
  User,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckHistoryChat } from "@/components/profile/check-history-chat";
import { toast } from "sonner";

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  const handleLogout = async () => {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setLoggingOut(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/15">
            <User className="size-7 text-electric" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
        </div>

        {/* Account info */}
        <Card className="glass glass-border mb-6">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Mail className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="truncate text-sm font-medium">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full sm:w-auto"
            >
              {loggingOut ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 size-4" />
              )}
              Log out
            </Button>
          </CardContent>
        </Card>

        {/* Chat-style history panel */}
        <Card className="glass glass-border overflow-hidden">
          <div className="h-[600px] sm:h-[680px]">
            <CheckHistoryChat
              key={historyKey}
              onHistoryCleared={() => setHistoryKey((k) => k + 1)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
