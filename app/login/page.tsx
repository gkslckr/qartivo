import Link from "next/link";
import AuthForm from "../auth-form";
import AuthLayout from "../auth-layout";

export default function LoginPage() {
  return <AuthLayout><p className="auth-eyebrow">Willkommen bei Qartivo</p><h1>Willkommen zurück</h1><p className="auth-intro">Melden Sie sich an und verwalten Sie Ihr digitales Restaurant.</p><AuthForm mode="login" /><Link className="auth-forgot-link" href="/forgot-password">Passwort vergessen?</Link><p className="auth-switch">Noch kein Konto? <Link href="/register">Konto erstellen</Link></p></AuthLayout>;
}
