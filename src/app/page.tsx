import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare, LogIn, UserPlus, Sparkles } from "lucide-react";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifyTokenSafe } from "@/lib/auth/jwt";
import { Button } from "@/components/ui/button";

/**
 * Public welcome and portal gateway for WhisperLink.
 * Redirects authenticated users to the dashboard.
 * Presents unauthenticated users with quick portals to Log In or Register.
 */
export default async function Home() {
  const token = await getSessionCookie();
  const session = token ? await verifyTokenSafe(token) : null;

  // Server-side redirect to dashboard if already authenticated
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen bg-[#07070e] text-foreground flex flex-col justify-between overflow-hidden font-sans">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="border-b border-white/5 bg-[#07070e]/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <MessageSquare className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              WhisperLink
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="rounded-xl px-4 text-muted-foreground hover:text-foreground">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="rounded-xl px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md shadow-indigo-500/10 text-white border-0">
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Welcome Portal Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div className="max-w-3xl w-full text-center space-y-12">
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-400 font-semibold tracking-wide uppercase mx-auto animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Anonymous Feedback Platform</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Welcome to <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">WhisperLink</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Send anonymous messages. Receive honest feedback. Get started by logging in or creating your unique link below.
            </p>
          </div>

          {/* Action Portals */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left pt-4">
            {/* Login Card */}
            <div className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="h-11 w-11 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <LogIn className="h-5.5 w-5.5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Log In</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Already have an account? Sign in to access your dashboard, view your messages, and manage settings.
                </p>
              </div>
              <Button asChild className="w-full rounded-xl py-5 shadow-lg shadow-indigo-500/5 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
                <Link href="/login" className="flex items-center justify-center gap-2">
                  <span>Go to Login</span>
                  <LogIn className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Register Card */}
            <div className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm hover:border-purple-500/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="h-5.5 w-5.5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Register</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  New to WhisperLink? Sign up now to create your unique link and start gathering anonymous feedback.
                </p>
              </div>
              <Button asChild className="w-full rounded-xl py-5 shadow-lg shadow-purple-500/5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0">
                <Link href="/register" className="flex items-center justify-center gap-2">
                  <span>Create Account</span>
                  <UserPlus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="border-t border-white/5 py-8 bg-[#07070e]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} WhisperLink. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
