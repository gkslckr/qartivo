import Link from "next/link";
import AuthForm from "../auth-form";
import AuthLayout from "../auth-layout";

export default function RegisterPage() {
  return <AuthLayout><p className="auth-eyebrow">Qartivo für Restaurants</p><h1>Konto erstellen</h1><p className="auth-intro">Starten Sie jetzt mit der digitalen Basis für Ihr Restaurant.</p><AuthForm mode="register" /><p className="auth-switch">Bereits registriert? <Link href="/login">Einloggen</Link></p></AuthLayout>;
}
