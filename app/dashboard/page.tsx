import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "../logout-button";
import { createClient } from "@/lib/supabase/server";

function DashboardIcon({ name }: { name: "grid" | "menu" | "qr" | "settings" | "arrow" | "plus" }) {
  const common = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "grid") return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 6h16M4 12h16M4 18h10" /></svg>;
  if (name === "qr") return <svg {...common}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2M20 14v6M14 18h3" /></svg>;
  if (name === "settings") return <svg {...common}><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /><path d="m4.9 15-.8 1.4 1.9 1.9 1.4-.8M19.1 15l.8 1.4-1.9 1.9-1.4-.8M9 4.9 10.4 4l1.9 1.9M15 4.9 13.6 4l-1.9 1.9M4 12H2M22 12h-2M9 19.1 10.4 20l1.9-1.9M15 19.1l-1.4.9-1.9-1.9" /></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
}

type DashboardData = {
  restaurant: { id: string; name: string; slug: string; city: string | null; country: string; is_active: boolean } | null;
  role: string | null;
  menus: { id: string; name: string; is_published: boolean }[];
  qrCodes: { id: string; is_active: boolean }[];
};

async function loadDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("restaurant_members")
    .select("restaurant_id, role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) return { restaurant: null, role: null, menus: [], qrCodes: [] };

  const [restaurantResult, menusResult, qrResult] = await Promise.all([
    supabase.from("restaurants").select("id, name, slug, city, country, is_active").eq("id", membership.restaurant_id).maybeSingle(),
    supabase.from("menus").select("id, name, is_published").eq("restaurant_id", membership.restaurant_id).order("created_at", { ascending: true }),
    supabase.from("qr_codes").select("id, is_active").eq("restaurant_id", membership.restaurant_id),
  ]);

  return {
    restaurant: restaurantResult.data,
    role: membership.role,
    menus: menusResult.data ?? [],
    qrCodes: qrResult.data ?? [],
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await loadDashboardData(user.id);
  const publishedMenus = data.menus.filter((menu) => menu.is_published).length;
  const activeQrCodes = data.qrCodes.filter((code) => code.is_active).length;
  const firstName = user.user_metadata?.first_name || "dort";

  return <main className="dashboard-page"><div className="dashboard-shell"><header className="dashboard-nav"><Link href="/" className="logo" aria-label="qartivo Startseite"><span className="logo-mark">Q</span><span>qartivo</span></Link><div className="dashboard-nav-actions"><span className="dashboard-user-email">{user.email}</span><LogoutButton /></div></header><div className="dashboard-layout"><aside className="dashboard-sidebar-nav"><p className="dashboard-sidebar-label">Workspace</p><a className="dashboard-sidebar-link active" href="#overview"><DashboardIcon name="grid" /> Übersicht</a><a className="dashboard-sidebar-link" href="#menues"><DashboardIcon name="menu" /> Menüs</a><a className="dashboard-sidebar-link" href="#qr-codes"><DashboardIcon name="qr" /> QR-Codes</a><a className="dashboard-sidebar-link" href="#einstellungen"><DashboardIcon name="settings" /> Einstellungen</a><div className="dashboard-sidebar-restaurant"><span>{data.restaurant?.name.slice(0, 1).toUpperCase() || "Q"}</span><div><strong>{data.restaurant?.name || "Noch kein Restaurant"}</strong><small>{data.restaurant?.city || "Workspace"}</small></div></div></aside><section className="dashboard-main" id="overview"><div className="dashboard-heading"><div><p className="auth-eyebrow">Ihr Arbeitsbereich</p><h1>Guten Morgen, {firstName}.</h1><p>Alles Wichtige für Ihr Restaurant auf einen Blick.</p></div><span className="dashboard-role">{data.role || "Workspace"}</span></div>{data.restaurant ? <><div className="dashboard-restaurant-bar"><div><span className="dashboard-status-dot" /> <strong>{data.restaurant.name}</strong><span>{data.restaurant.city ? `${data.restaurant.city}, ` : ""}{data.restaurant.country}</span></div><span className={data.restaurant.is_active ? "dashboard-live" : "dashboard-inactive"}>{data.restaurant.is_active ? "Aktiv" : "Inaktiv"}</span></div><div className="dashboard-stat-grid"><div className="dashboard-stat-card"><span className="dashboard-stat-icon"><DashboardIcon name="menu" /></span><div><small>MENÜS</small><strong>{data.menus.length}</strong><p>{publishedMenus} veröffentlicht</p></div></div><div className="dashboard-stat-card"><span className="dashboard-stat-icon"><DashboardIcon name="qr" /></span><div><small>QR-CODES</small><strong>{data.qrCodes.length}</strong><p>{activeQrCodes} aktiv</p></div></div><div className="dashboard-stat-card"><span className="dashboard-stat-icon"><DashboardIcon name="grid" /></span><div><small>RESTAURANTSTATUS</small><strong>{data.restaurant.is_active ? "Live" : "Pausiert"}</strong><p>Profil ist {data.restaurant.is_active ? "sichtbar" : "inaktiv"}</p></div></div></div><div className="dashboard-content-grid"><section className="dashboard-panel" id="menues"><div className="dashboard-panel-header"><div><p className="dashboard-panel-kicker">Inhalte</p><h2>Ihre Menüs</h2></div><Link href="#menues" className="dashboard-panel-action"><DashboardIcon name="plus" /> Menü hinzufügen</Link></div>{data.menus.length ? <div className="dashboard-menu-list">{data.menus.map((menu) => <div className="dashboard-menu-row" key={menu.id}><span className="dashboard-menu-mark"><DashboardIcon name="menu" /></span><div><strong>{menu.name}</strong><small>{menu.is_published ? "Für Gäste sichtbar" : "Noch nicht veröffentlicht"}</small></div><span className={menu.is_published ? "dashboard-pill published" : "dashboard-pill draft"}>{menu.is_published ? "Veröffentlicht" : "Entwurf"}</span></div>)}</div> : <div className="dashboard-empty-state"><span><DashboardIcon name="menu" /></span><p>Noch kein Menü vorhanden.</p><small>Ihr erstes Menü kann hier verwaltet werden.</small></div>}</section><section className="dashboard-panel dashboard-quick-actions" id="qr-codes"><div className="dashboard-panel-header"><div><p className="dashboard-panel-kicker">Schnellzugriff</p><h2>Was möchten Sie tun?</h2></div></div><Link href="/dashboard/menus" className="dashboard-action-row"><span><DashboardIcon name="menu" /></span><div><strong>Menü verwalten</strong><small>Gerichte und Kategorien pflegen</small></div><DashboardIcon name="arrow" /></Link><Link href="#qr-codes" className="dashboard-action-row"><span><DashboardIcon name="qr" /></span><div><strong>QR-Code ansehen</strong><small>{activeQrCodes ? `${activeQrCodes} aktive QR-Codes` : "Noch kein QR-Code vorhanden"}</small></div><DashboardIcon name="arrow" /></Link></section></div></> : <div className="dashboard-empty-workspace"><span className="dashboard-placeholder-mark">Q</span><div><h2>Ihr Restaurantbereich wird vorbereitet.</h2><p>Für dieses Konto ist noch kein Restaurant hinterlegt. Sobald die Einrichtung abgeschlossen ist, erscheint Ihr Workspace hier.</p></div></div>}</section></div></div></main>;
}
