"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

type AuthErrorDetails = {
  message: string;
  code: string | null;
  status: number | null;
};

function getAuthErrorDetails(error: unknown): AuthErrorDetails {
  if (!error || typeof error !== "object") {
    return { message: "Ein unerwarteter Fehler ist aufgetreten.", code: null, status: null };
  }

  const authError = error as { message?: unknown; code?: unknown; status?: unknown };
  return {
    message: typeof authError.message === "string" && authError.message ? authError.message : "Ein unerwarteter Fehler ist aufgetreten.",
    code: typeof authError.code === "string" ? authError.code : null,
    status: typeof authError.status === "number" ? authError.status : null,
  };
}

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (isRegister && password !== passwordConfirmation) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName, last_name: lastName, restaurant_name: restaurantName },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (signUpError) throw signUpError;
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setMessage("Bitte bestätigen Sie Ihre E-Mail-Adresse. Wir haben Ihnen einen Bestätigungslink gesendet.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (caughtError) {
      const errorDetails = getAuthErrorDetails(caughtError);
      const isDevelopment = process.env.NODE_ENV !== "production";
      const detailMessage = [
        errorDetails.message,
        errorDetails.code ? `code=${errorDetails.code}` : null,
        errorDetails.status !== null ? `status=${errorDetails.status}` : null,
      ].filter(Boolean).join(" | ");

      if (isDevelopment) {
        console.error("[Qartivo Auth] Authentication request failed", {
          mode,
          message: errorDetails.message,
          code: errorDetails.code,
          status: errorDetails.status,
        });
      }

      setError(isDevelopment
        ? `Supabase-Fehler: ${detailMessage}`
        : errorDetails.message.includes("Supabase ist noch nicht konfiguriert")
        ? "Die Registrierung ist noch nicht konfiguriert. Bitte versuchen Sie es später erneut."
        : isRegister
          ? "Die Registrierung konnte nicht abgeschlossen werden. Bitte prüfen Sie Ihre Angaben."
          : "E-Mail-Adresse oder Passwort sind nicht korrekt.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <form className="auth-form" onSubmit={handleSubmit} noValidate>
    {isRegister && <div className="auth-form-row"><label><span>Vorname</span><input required value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" /></label><label><span>Nachname</span><input required value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" /></label></div>}
    {isRegister && <label><span>Restaurantname</span><input required value={restaurantName} onChange={(event) => setRestaurantName(event.target.value)} autoComplete="organization" /></label>}
    <label><span>E-Mail</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
    <label><span>Passwort</span><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? "new-password" : "current-password"} /></label>
    {isRegister && <label><span>Passwort bestätigen</span><input required minLength={8} type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} autoComplete="new-password" /></label>}
    {error && <p className="auth-feedback auth-error" role="alert">{error}</p>}
    {message && <p className="auth-feedback auth-success" role="status">{message}</p>}
    <button className="button auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Einen Moment …" : isRegister ? "Konto erstellen" : "Einloggen"}</button>
  </form>;
}
