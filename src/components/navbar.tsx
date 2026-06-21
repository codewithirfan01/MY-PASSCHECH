import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, Loader2, LogOut, Menu, Shield, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setLoggingOut(false);
    if (error) {
      toast.error("Failed to log out. Please try again.");
      return;
    }
    toast.success("Logged out successfully");
    navigate("/");
  };

  const links = user
    ? [
        { label: "Home", to: "/" },
        { label: "Dashboard", to: "/dashboard" },
        { label: "Reviews", to: "/reviews" },
        { label: "Profile", to: "/profile" },
      ]
    : [
        { label: "Home", to: "/" },
        { label: "Reviews", to: "/reviews" },
        { label: "Privacy", to: "/privacy" },
      ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-sm font-medium transition-colors hover:text-foreground",
      isActive ? "text-foreground" : "text-muted-foreground"
    );

  return (
    <header className="sticky top-0 z-50 w-full glass glass-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="size-6 text-electric" />
          <span className="text-lg font-semibold tracking-tight">
            Pass<span className="text-gradient-electric">Check</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              Logout
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border glass md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <div className="flex items-center justify-between">
                  {link.label}
                  <ChevronDown className="size-4 -rotate-90" />
                </div>
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {user ? (
                <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
                  {loggingOut ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup" onClick={() => setMobileOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
