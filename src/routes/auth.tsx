import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { z } from "zod";

import { auth } from "../lib/firebase";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — AshaAI" }, { name: "description", content: "Log in or sign up to AshaAI." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "login" } = Route.useSearch();
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      await window.fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.setItem("user", JSON.stringify({
        displayName: result.user.displayName,
        email: result.user.email,
      }));
      localStorage.setItem("idToken", token);
      console.log("User:", result.user);

      // Send welcome email
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "/api/send-email";
        await window.fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: result.user.email,
            message: "Welcome to AshaAI!",
          }),
        });
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }

      navigate({ to: "/dashboard" });
    } catch (error) {
      console.error(error);
      alert("Google Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-foreground text-white">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
            <div className="size-4 border-2 border-white rounded-sm" />
          </div>
          <span className="font-extrabold text-xl tracking-tighter">AshaAI</span>
        </Link>
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">Government Navigator</p>
          <h2 className="text-4xl font-extrabold leading-tight mb-6 max-w-md">
            Your personal AI assistant for Indian government opportunities.
          </h2>
          <p className="text-white/60 max-w-md">
            Discover schemes, verify links and apply safely — in your own language.
          </p>
        </div>
        <div className="text-xs font-mono uppercase tracking-widest text-white/40">
          Verified by NIC · Trusted by 1.2M citizens
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="size-4 border-2 border-white rounded-sm" />
            </div>
            <span className="font-extrabold text-xl">AshaAI</span>
          </div>

          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            {isSignup ? "Create your account" : "Welcome back"}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight mb-8">
            {isSignup ? "Sign up to AshaAI" : "Log in to AshaAI"}
          </h1>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border bg-background hover:bg-muted font-medium mb-4 disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">or email</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              setTimeout(() => navigate({ to: "/dashboard" }), 600);
            }}
            className="space-y-4"
          >
            {isSignup && (
              <Field label="Full name" type="text" placeholder="Rahul Sharma" />
            )}
            <Field label="Email" type="email" placeholder="you@example.in" />
            <Field label="Password" type="password" placeholder="••••••••" />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/20 transition disabled:opacity-60"
            >
              {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground text-center">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              to="/auth"
              search={{ mode: isSignup ? "login" : "signup" }}
              className="text-primary font-semibold hover:underline"
            >
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        required
        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.99.66-2.26 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}