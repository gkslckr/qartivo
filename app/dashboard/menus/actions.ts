"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RestaurantRole } from "@/lib/supabase/database.types";

const editorRoles: RestaurantRole[] = ["owner", "admin", "editor"];

type ActionResult = { error?: string; success?: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "menu";
}

async function requireRestaurantRole(roles: RestaurantRole[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an." };

  const { data: membership } = await supabase
    .from("restaurant_members")
    .select("restaurant_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership || !roles.includes(membership.role)) {
    return { supabase, error: "Sie haben keine Berechtigung für diese Aktion." };
  }

  return { supabase, restaurantId: membership.restaurant_id };
}

export async function createMenu(name: string): Promise<ActionResult> {
  const trimmedName = name.trim();
  if (!trimmedName) return { error: "Bitte geben Sie einen Menünamen ein." };

  const context = await requireRestaurantRole(editorRoles);
  if (context.error || !context.restaurantId) return { error: context.error };

  const slug = `${slugify(trimmedName)}-${Date.now().toString(36)}`;
  const { error } = await context.supabase.from("menus").insert({
    restaurant_id: context.restaurantId,
    name: trimmedName,
    slug,
    is_default: false,
  });

  if (error) return { error: "Das Menü konnte nicht erstellt werden." };
  revalidatePath("/dashboard/menus");
  revalidatePath("/dashboard");
  return { success: "Menü erstellt." };
}

export async function updateMenu(menuId: string, name: string, isPublished: boolean): Promise<ActionResult> {
  const trimmedName = name.trim();
  if (!trimmedName) return { error: "Bitte geben Sie einen Menünamen ein." };

  const context = await requireRestaurantRole(editorRoles);
  if (context.error || !context.restaurantId) return { error: context.error };

  const { error } = await context.supabase
    .from("menus")
    .update({ name: trimmedName, is_published: isPublished })
    .eq("id", menuId)
    .eq("restaurant_id", context.restaurantId);

  if (error) return { error: "Das Menü konnte nicht gespeichert werden." };
  revalidatePath("/dashboard/menus");
  revalidatePath("/dashboard");
  return { success: "Menü gespeichert." };
}

export async function createCategory(menuId: string, name: string, description: string): Promise<ActionResult> {
  const trimmedName = name.trim();
  if (!trimmedName) return { error: "Bitte geben Sie einen Kategorienamen ein." };

  const context = await requireRestaurantRole(editorRoles);
  if (context.error || !context.restaurantId) return { error: context.error };

  const { data: menu } = await context.supabase.from("menus").select("id").eq("id", menuId).eq("restaurant_id", context.restaurantId).maybeSingle();
  if (!menu) return { error: "Menü nicht gefunden." };

  const { data: lastCategory } = await context.supabase.from("menu_categories").select("sort_order").eq("menu_id", menuId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await context.supabase.from("menu_categories").insert({ menu_id: menuId, name: trimmedName, description: description.trim() || null, sort_order: (lastCategory?.sort_order ?? -1) + 1 });

  if (error) return { error: "Die Kategorie konnte nicht erstellt werden." };
  revalidatePath("/dashboard/menus");
  return { success: "Kategorie erstellt." };
}

export async function updateCategory(categoryId: string, name: string, description: string): Promise<ActionResult> {
  const trimmedName = name.trim();
  if (!trimmedName) return { error: "Bitte geben Sie einen Kategorienamen ein." };

  const context = await requireRestaurantRole(editorRoles);
  if (context.error || !context.restaurantId) return { error: context.error };

  const { data: category } = await context.supabase.from("menu_categories").select("id, menu_id").eq("id", categoryId).maybeSingle();
  if (!category) return { error: "Kategorie nicht gefunden." };
  const { data: menu } = await context.supabase.from("menus").select("id").eq("id", category.menu_id).eq("restaurant_id", context.restaurantId).maybeSingle();
  if (!menu) return { error: "Kategorie nicht gefunden." };

  const { error } = await context.supabase.from("menu_categories").update({ name: trimmedName, description: description.trim() || null }).eq("id", categoryId);
  if (error) return { error: "Die Kategorie konnte nicht gespeichert werden." };
  revalidatePath("/dashboard/menus");
  return { success: "Kategorie gespeichert." };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const context = await requireRestaurantRole(editorRoles);
  if (context.error || !context.restaurantId) return { error: context.error };

  const { data: category } = await context.supabase.from("menu_categories").select("id, menu_id").eq("id", categoryId).maybeSingle();
  if (!category) return { error: "Kategorie nicht gefunden." };
  const { data: menu } = await context.supabase.from("menus").select("id").eq("id", category.menu_id).eq("restaurant_id", context.restaurantId).maybeSingle();
  if (!menu) return { error: "Kategorie nicht gefunden." };

  const { error } = await context.supabase.from("menu_categories").delete().eq("id", categoryId);
  if (error) return { error: "Die Kategorie konnte nicht gelöscht werden." };
  revalidatePath("/dashboard/menus");
  return { success: "Kategorie gelöscht." };
}

export async function createItem(categoryId: string, name: string, description: string, price: number, isAvailable: boolean): Promise<ActionResult> {
  const trimmedName = name.trim();
  if (!trimmedName) return { error: "Bitte geben Sie einen Artikelnamen ein." };
  if (!Number.isFinite(price) || price < 0) return { error: "Bitte geben Sie einen gültigen Preis ein." };

  const context = await requireRestaurantRole(editorRoles);
  if (context.error || !context.restaurantId) return { error: context.error };

  const { data: category } = await context.supabase.from("menu_categories").select("id, menu_id").eq("id", categoryId).maybeSingle();
  if (!category) return { error: "Kategorie nicht gefunden." };
  const { data: menu } = await context.supabase.from("menus").select("id").eq("id", category.menu_id).eq("restaurant_id", context.restaurantId).maybeSingle();
  if (!menu) return { error: "Kategorie nicht gefunden." };

  const { data: lastItem } = await context.supabase.from("menu_items").select("sort_order").eq("category_id", categoryId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await context.supabase.from("menu_items").insert({ category_id: categoryId, name: trimmedName, description: description.trim() || null, price, is_available: isAvailable, sort_order: (lastItem?.sort_order ?? -1) + 1 });
  if (error) return { error: "Der Artikel konnte nicht erstellt werden." };
  revalidatePath("/dashboard/menus");
  return { success: "Artikel erstellt." };
}

export async function updateItem(itemId: string, name: string, description: string, price: number, isAvailable: boolean): Promise<ActionResult> {
  const trimmedName = name.trim();
  if (!trimmedName) return { error: "Bitte geben Sie einen Artikelnamen ein." };
  if (!Number.isFinite(price) || price < 0) return { error: "Bitte geben Sie einen gültigen Preis ein." };

  const context = await requireRestaurantRole(editorRoles);
  if (context.error || !context.restaurantId) return { error: context.error };

  const { data: item } = await context.supabase.from("menu_items").select("id, category_id").eq("id", itemId).maybeSingle();
  if (!item) return { error: "Artikel nicht gefunden." };
  const { data: category } = await context.supabase.from("menu_categories").select("id, menu_id").eq("id", item.category_id).maybeSingle();
  const { data: menu } = category ? await context.supabase.from("menus").select("id").eq("id", category.menu_id).eq("restaurant_id", context.restaurantId).maybeSingle() : { data: null };
  if (!menu) return { error: "Artikel nicht gefunden." };

  const { error } = await context.supabase.from("menu_items").update({ name: trimmedName, description: description.trim() || null, price, is_available: isAvailable }).eq("id", itemId);
  if (error) return { error: "Der Artikel konnte nicht gespeichert werden." };
  revalidatePath("/dashboard/menus");
  return { success: "Artikel gespeichert." };
}

export async function deleteItem(itemId: string): Promise<ActionResult> {
  const context = await requireRestaurantRole(editorRoles);
  if (context.error || !context.restaurantId) return { error: context.error };

  const { data: item } = await context.supabase.from("menu_items").select("id, category_id").eq("id", itemId).maybeSingle();
  if (!item) return { error: "Artikel nicht gefunden." };
  const { data: category } = await context.supabase.from("menu_categories").select("id, menu_id").eq("id", item.category_id).maybeSingle();
  const { data: menu } = category ? await context.supabase.from("menus").select("id").eq("id", category.menu_id).eq("restaurant_id", context.restaurantId).maybeSingle() : { data: null };
  if (!menu) return { error: "Artikel nicht gefunden." };

  const { error } = await context.supabase.from("menu_items").delete().eq("id", itemId);
  if (error) return { error: "Der Artikel konnte nicht gelöscht werden." };
  revalidatePath("/dashboard/menus");
  return { success: "Artikel gelöscht." };
}

export async function moveCategory(categoryId: string, direction: "up" | "down"): Promise<ActionResult> {
  const context = await requireRestaurantRole(editorRoles);
  if (context.error || !context.restaurantId) return { error: context.error };
  const { data: category } = await context.supabase.from("menu_categories").select("id, menu_id, sort_order").eq("id", categoryId).maybeSingle();
  if (!category) return { error: "Kategorie nicht gefunden." };
  const { data: menu } = await context.supabase.from("menus").select("id").eq("id", category.menu_id).eq("restaurant_id", context.restaurantId).maybeSingle();
  if (!menu) return { error: "Kategorie nicht gefunden." };
  const comparison = direction === "up" ? "lt" : "gt";
  const orderAscending = direction === "up";
  const { data: sibling } = await context.supabase.from("menu_categories").select("id, sort_order").eq("menu_id", category.menu_id).filter("sort_order", comparison, category.sort_order).order("sort_order", { ascending: orderAscending }).limit(1).maybeSingle();
  if (!sibling) return { success: "Bereits an der richtigen Position." };
  await context.supabase.from("menu_categories").update({ sort_order: sibling.sort_order }).eq("id", category.id);
  await context.supabase.from("menu_categories").update({ sort_order: category.sort_order }).eq("id", sibling.id);
  revalidatePath("/dashboard/menus");
  return { success: "Reihenfolge gespeichert." };
}

export async function moveItem(itemId: string, direction: "up" | "down"): Promise<ActionResult> {
  const context = await requireRestaurantRole(editorRoles);
  if (context.error || !context.restaurantId) return { error: context.error };
  const { data: item } = await context.supabase.from("menu_items").select("id, category_id, sort_order").eq("id", itemId).maybeSingle();
  if (!item) return { error: "Artikel nicht gefunden." };
  const { data: category } = await context.supabase.from("menu_categories").select("id, menu_id").eq("id", item.category_id).maybeSingle();
  const { data: menu } = category ? await context.supabase.from("menus").select("id").eq("id", category.menu_id).eq("restaurant_id", context.restaurantId).maybeSingle() : { data: null };
  if (!menu) return { error: "Artikel nicht gefunden." };
  const comparison = direction === "up" ? "lt" : "gt";
  const { data: sibling } = await context.supabase.from("menu_items").select("id, sort_order").eq("category_id", item.category_id).filter("sort_order", comparison, item.sort_order).order("sort_order", { ascending: direction === "up" }).limit(1).maybeSingle();
  if (!sibling) return { success: "Bereits an der richtigen Position." };
  await context.supabase.from("menu_items").update({ sort_order: sibling.sort_order }).eq("id", item.id);
  await context.supabase.from("menu_items").update({ sort_order: item.sort_order }).eq("id", sibling.id);
  revalidatePath("/dashboard/menus");
  return { success: "Reihenfolge gespeichert." };
}
