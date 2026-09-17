"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import AuthLayout from "../auth-layout";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setHasSession(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== passwordConfirmation) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage("Ihr Passwort wurde erfolgreich aktualisiert.");
      setPassword("");
      setPasswordConfirmation("");
    } catch (caughtError) {
      if (process.env.NODE_ENV !== "production") console.error("[Qartivo Auth] Password update failed", caughtError);
      setError("Der Passwort-Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Link an.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <AuthLayout><p className="auth-eyebrow">Neues Passwort</p><h1>Passwort zurücksetzen</h1><p className="auth-intro">Wählen Sie ein neues Passwort für Ihr Qartivo-Konto.</p>{hasSession === null ? <p className="auth-feedback auth-success" role="status">Sitzung wird geprüft …</p> : hasSession ? message ? <><p className="auth-feedback auth-success" role="status">{message}</p><p className="auth-switch"><Link href="/login">Zum Login</Link></p></> : <form className="auth-form" onSubmit={handleSubmit} noValidate><label><span>Neues Passwort</span><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /></label><label><span>Passwort bestätigen</span><input required minLength={8} type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} autoComplete="new-password" /></label>{error && <p className="auth-feedback auth-error" role="alert">{error}</p>}<button className="button auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Einen Moment …" : "Passwort speichern"}</button></form> : <><p className="auth-feedback auth-error" role="alert">Dieser Passwort-Link ist ungültig oder abgelaufen.</p><p className="auth-switch"><Link href="/forgot-password">Neuen Link anfordern</Link></p></>}</AuthLayout>;
}
