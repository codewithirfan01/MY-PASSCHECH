import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthGuard } from "@/components/auth-guard";
import { LandingPage } from "@/pages/landing-page";
import { SignupPage } from "@/pages/signup-page";
import { LoginPage } from "@/pages/login-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { ProfilePage } from "@/pages/profile-page";
import { PrivacyPage } from "@/pages/privacy-page";
import { ReviewsPage } from "@/pages/reviews-page";

function Layout() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route element={<AuthGuard />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
