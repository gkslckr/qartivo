"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createCategory, createItem, createMenu, deleteCategory, deleteItem, moveCategory, moveItem, updateCategory, updateItem, updateMenu } from "./actions";

export type MenuEditorData = {
  restaurant: { id: string; name: string; city: string | null; country: string } | null;
  role: string | null;
  menus: {
    id: string; name: string; slug: string; description: string | null; is_published: boolean; is_default: boolean; created_at: string;
    categories: { id: string; menu_id: string; name: string; description: string | null; sort_order: number; is_active: boolean; items: { id: string; category_id: string; name: string; description: string | null; price: number; currency: string; sort_order: number; is_available: boolean }[] }[];
  }[];
};

type Feedback = { type: "success" | "error"; text: string } | null;

function Icon({ name }: { name: "menu" | "plus" | "arrow" | "trash" | "edit" | "up" | "down" | "back" }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "menu") return <svg {...common}><path d="M4 6h16M4 12h16M4 18h10" /></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
  if (name === "trash") return <svg {...common}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>;
  if (name === "edit") return <svg {...common}><path d="m4 16-.7 4.7L8 20l11-11a2.1 2.1 0 0 0-3-3L5 17" /></svg>;
  if (name === "up") return <svg {...common}><path d="m6 14 6-6 6 6" /></svg>;
  if (name === "down") return <svg {...common}><path d="m6 10 6 6 6-6" /></svg>;
  return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>;
}

function ActionButton({ label, icon, onClick, danger = false }: { label: string; icon: "edit" | "trash" | "up" | "down"; onClick: () => void; danger?: boolean }) {
  return <button type="button" className={`editor-icon-button ${danger ? "danger" : ""}`} aria-label={label} title={label} onClick={onClick}><Icon name={icon} /></button>;
}

export default function MenuEditor({ initialData }: { initialData: MenuEditorData }) {
  const [data, setData] = useState(initialData);
  const [selectedMenuId, setSelectedMenuId] = useState(initialData.menus[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [menuName, setMenuName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemAvailable, setItemAvailable] = useState(true);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const selectedMenu = data.menus.find((menu) => menu.id === selectedMenuId) ?? null;
  const canEdit = data.role === "owner" || data.role === "admin" || data.role === "editor";
  const canDelete = canEdit;

  function runAction(action: () => Promise<{ error?: string; success?: string }>, onSuccess?: () => void) {
    setFeedback(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setFeedback({ type: "error", text: result.error });
      else { setFeedback({ type: "success", text: result.success ?? "Gespeichert." }); onSuccess?.(); }
    });
  }

  function refreshAfterAction() {
    window.location.reload();
  }

  function submitMenu(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(() => createMenu(menuName), () => { setMenuName(""); refreshAfterAction(); });
  }

  function saveMenu(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMenu) return;
    runAction(() => updateMenu(selectedMenu.id, selectedMenu.name, selectedMenu.is_published), refreshAfterAction);
  }

  function submitCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMenu) return;
    if (editingCategoryId) runAction(() => updateCategory(editingCategoryId, categoryName, categoryDescription), refreshAfterAction);
    else runAction(() => createCategory(selectedMenu.id, categoryName, categoryDescription), () => { setCategoryName(""); setCategoryDescription(""); refreshAfterAction(); });
  }

  function submitItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!itemCategoryId) return;
    const price = Number(itemPrice.replace(",", "."));
    if (editingItemId) runAction(() => updateItem(editingItemId, itemName, itemDescription, price, itemAvailable), refreshAfterAction);
    else runAction(() => createItem(itemCategoryId, itemName, itemDescription, price, itemAvailable), () => { setItemName(""); setItemDescription(""); setItemPrice(""); setItemAvailable(true); refreshAfterAction(); });
  }

  function startCategoryEdit(category: MenuEditorData["menus"][number]["categories"][number]) { setEditingCategoryId(category.id); setCategoryName(category.name); setCategoryDescription(category.description ?? ""); }
  function startItemEdit(item: MenuEditorData["menus"][number]["categories"][number]["items"][number], categoryId: string) { setEditingItemId(item.id); setItemCategoryId(categoryId); setItemName(item.name); setItemDescription(item.description ?? ""); setItemPrice(item.price.toFixed(2)); setItemAvailable(item.is_available); }

  return <main className="dashboard-page"><div className="dashboard-shell"><header className="dashboard-nav"><Link href="/dashboard" className="logo" aria-label="Zurück zum Dashboard"><span className="logo-mark">Q</span><span>qartivo</span></Link><Link href="/dashboard" className="editor-back-link"><Icon name="back" /> Dashboard</Link></header><div className="editor-page"><div className="editor-heading"><div><p className="auth-eyebrow">Restaurant-Inhalte</p><h1>Menüs verwalten</h1><p>Pflegen Sie Ihre Speisekarten, Kategorien und Artikel an einem Ort.</p></div>{data.restaurant && <span className="editor-restaurant-badge">{data.restaurant.name}</span>}</div>{feedback && <p className={`editor-feedback ${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.text}</p>}{!data.restaurant ? <div className="editor-empty"><span className="dashboard-placeholder-mark">Q</span><h2>Noch kein Restaurant verfügbar</h2><p>Für dieses Konto ist noch kein Restaurant hinterlegt.</p></div> : <><div className="editor-layout"><aside className="editor-menu-list"><div className="editor-section-heading"><div><p className="dashboard-panel-kicker">Ihre Inhalte</p><h2>Menüs</h2></div><span>{data.menus.length}</span></div>{data.menus.length ? data.menus.map((menu) => <button type="button" className={`editor-menu-option ${selectedMenuId === menu.id ? "active" : ""}`} key={menu.id} onClick={() => setSelectedMenuId(menu.id)}><span className="editor-menu-option-icon"><Icon name="menu" /></span><span><strong>{menu.name}</strong><small>{menu.is_published ? "Veröffentlicht" : "Entwurf"}</small></span></button>) : <p className="editor-muted">Noch kein Menü erstellt.</p>}{canEdit && <form className="editor-create-menu" onSubmit={submitMenu}><input aria-label="Neuer Menüname" placeholder="Neues Menü" value={menuName} onChange={(event) => setMenuName(event.target.value)} /><button className="editor-primary-small" type="submit" disabled={isPending}><Icon name="plus" /> Erstellen</button></form>}</aside><section className="editor-workspace">{selectedMenu ? <><form className="editor-menu-header" onSubmit={saveMenu}><div><label className="editor-field-label" htmlFor="menu-name">Menüname</label><input id="menu-name" className="editor-title-input" value={selectedMenu.name} disabled={!canEdit} onChange={(event) => setData((current) => ({ ...current, menus: current.menus.map((menu) => menu.id === selectedMenu.id ? { ...menu, name: event.target.value } : menu) }))} /></div><div className="editor-header-actions"><label className="editor-toggle"><input type="checkbox" checked={selectedMenu.is_published} disabled={!canEdit} onChange={(event) => setData((current) => ({ ...current, menus: current.menus.map((menu) => menu.id === selectedMenu.id ? { ...menu, is_published: event.target.checked } : menu) }))} /><span /> Veröffentlicht</label>{canEdit && <button className="editor-primary-small" type="submit" disabled={isPending}>Speichern</button>}</div></form><div className="editor-toolbar"><div><p className="dashboard-panel-kicker">Struktur</p><h2>Kategorien und Artikel</h2></div>{!canEdit && <span className="editor-readonly">Nur Leserechte</span>}</div>{selectedMenu.categories.map((category, categoryIndex) => <article className="editor-category" key={category.id}><div className="editor-category-header"><div><span className="editor-order">{String(categoryIndex + 1).padStart(2, "0")}</span><strong>{category.name}</strong><small>{category.items.length} {category.items.length === 1 ? "Artikel" : "Artikel"}</small></div>{canEdit && <div className="editor-row-actions"><ActionButton label="Nach oben" icon="up" onClick={() => runAction(() => moveCategory(category.id, "up"), refreshAfterAction)} /><ActionButton label="Nach unten" icon="down" onClick={() => runAction(() => moveCategory(category.id, "down"), refreshAfterAction)} /><ActionButton label="Kategorie bearbeiten" icon="edit" onClick={() => startCategoryEdit(category)} />{canDelete && <ActionButton label="Kategorie löschen" icon="trash" danger onClick={() => runAction(() => deleteCategory(category.id), refreshAfterAction)} />}</div>}</div>{category.description && <p className="editor-category-description">{category.description}</p>}<div className="editor-items">{category.items.map((item) => <div className={`editor-item ${item.is_available ? "" : "unavailable"}`} key={item.id}><div className="editor-item-copy"><strong>{item.name}</strong><small>{item.description || "Keine Beschreibung"}</small></div><span className="editor-item-price">{item.price.toFixed(2)} {item.currency === "EUR" ? "€" : item.currency}</span>{canEdit && <div className="editor-row-actions"><ActionButton label="Nach oben" icon="up" onClick={() => runAction(() => moveItem(item.id, "up"), refreshAfterAction)} /><ActionButton label="Nach unten" icon="down" onClick={() => runAction(() => moveItem(item.id, "down"), refreshAfterAction)} /><ActionButton label="Artikel bearbeiten" icon="edit" onClick={() => startItemEdit(item, category.id)} />{canDelete && <ActionButton label="Artikel löschen" icon="trash" danger onClick={() => runAction(() => deleteItem(item.id), refreshAfterAction)} />}</div>}</div>)}</div>{canEdit && <form className="editor-inline-form" onSubmit={submitItem}><input type="hidden" value={category.id} readOnly /><input aria-label="Artikelname" placeholder="Artikelname" value={itemCategoryId === category.id ? itemName : ""} onFocus={() => setItemCategoryId(category.id)} onChange={(event) => { setItemCategoryId(category.id); setItemName(event.target.value); }} /><input aria-label="Beschreibung" placeholder="Kurze Beschreibung" value={itemCategoryId === category.id ? itemDescription : ""} onFocus={() => setItemCategoryId(category.id)} onChange={(event) => { setItemCategoryId(category.id); setItemDescription(event.target.value); }} /><input aria-label="Preis" placeholder="Preis" inputMode="decimal" value={itemCategoryId === category.id ? itemPrice : ""} onFocus={() => setItemCategoryId(category.id)} onChange={(event) => { setItemCategoryId(category.id); setItemPrice(event.target.value); }} /><label className="editor-availability"><input type="checkbox" checked={itemCategoryId === category.id ? itemAvailable : true} onChange={(event) => { setItemCategoryId(category.id); setItemAvailable(event.target.checked); }} /> Sichtbar</label><button className="editor-add-button" type="submit" disabled={isPending}><Icon name="plus" /> {editingItemId ? "Artikel speichern" : "Artikel hinzufügen"}</button></form>}</article>)}{canEdit && <form className="editor-category-form" onSubmit={submitCategory}><input aria-label="Kategoriename" placeholder="Neue Kategorie" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} /><input aria-label="Kategoriebeschreibung" placeholder="Beschreibung (optional)" value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} /><button className="editor-primary-small" type="submit" disabled={isPending}><Icon name="plus" /> {editingCategoryId ? "Kategorie speichern" : "Kategorie hinzufügen"}</button></form>}</> : <div className="editor-empty"><span className="dashboard-placeholder-mark">Q</span><h2>Wählen Sie ein Menü</h2><p>Erstellen Sie links ein Menü, um Kategorien und Artikel zu verwalten.</p></div>}</section></div></>}</div></div></main>;
}
