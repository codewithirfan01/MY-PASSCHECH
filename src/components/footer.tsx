import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border glass mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row lg:px-8">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-electric" />
          <span className="text-sm font-semibold">
            Pass<span className="text-gradient-electric">Check</span>
          </span>
          <span className="text-sm text-muted-foreground">— Student project, academic use</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <span className="hidden sm:inline">
            We never store your passwords.
          </span>
        </div>
      </div>
    </footer>
  );
}
