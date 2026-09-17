import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "./logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth-page"><div className="auth-shell"><div className="auth-brand"><Logo /></div><div className="auth-card">{children}</div><p className="auth-legal">Mit Qartivo digitalisieren Sie Ihr Restaurant einfach und professionell.</p><Link className="auth-back" href="/">Zurück zu qartivo</Link></div></main>;
}
