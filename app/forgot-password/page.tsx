"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import AuthLayout from "../auth-layout";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError && process.env.NODE_ENV !== "production") {
        console.error("[Qartivo Auth] Password reset request failed", resetError);
      }

      setMessage("Wenn ein Konto mit dieser E-Mail-Adresse vorhanden ist, erhalten Sie in Kürze einen Link zum Zurücksetzen Ihres Passworts.");
    } catch (caughtError) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[Qartivo Auth] Password reset request failed", caughtError);
      }
      setMessage("Wenn ein Konto mit dieser E-Mail-Adresse vorhanden ist, erhalten Sie in Kürze einen Link zum Zurücksetzen Ihres Passworts.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <AuthLayout><p className="auth-eyebrow">Zugang wiederherstellen</p><h1>Passwort vergessen?</h1><p className="auth-intro">Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen sicheren Link zum Zurücksetzen.</p>{message ? <p className="auth-feedback auth-success" role="status">{message}</p> : <form className="auth-form" onSubmit={handleSubmit} noValidate><label><span>E-Mail</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>{error && <p className="auth-feedback auth-error" role="alert">{error}</p>}<button className="button auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Einen Moment …" : "Reset-Link senden"}</button></form>}<p className="auth-switch"><Link href="/login">Zurück zum Einloggen</Link></p></AuthLayout>;
}
