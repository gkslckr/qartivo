import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MenuEditor, { type MenuEditorData } from "./menu-editor";

export default async function MenusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("restaurant_members")
    .select("restaurant_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) return <MenuEditor initialData={{ restaurant: null, role: null, menus: [] }} />;

  const [{ data: restaurant }, { data: menus }] = await Promise.all([
    supabase.from("restaurants").select("id, name, city, country").eq("id", membership.restaurant_id).maybeSingle(),
    supabase.from("menus").select("id, name, slug, description, is_published, is_default, created_at").eq("restaurant_id", membership.restaurant_id).order("created_at", { ascending: true }),
  ]);

  const menuRows = menus ?? [];
  const menuIds = menuRows.map((menu) => menu.id);
  const { data: categories } = menuIds.length ? await supabase.from("menu_categories").select("id, menu_id, name, description, sort_order, is_active").in("menu_id", menuIds).order("sort_order", { ascending: true }) : { data: [] };
  const categoryRows = categories ?? [];
  const categoryIds = categoryRows.map((category) => category.id);
  const { data: items } = categoryIds.length ? await supabase.from("menu_items").select("id, category_id, name, description, price, currency, sort_order, is_available").in("category_id", categoryIds).order("sort_order", { ascending: true }) : { data: [] };

  const initialData: MenuEditorData = {
    restaurant: restaurant ?? null,
    role: membership.role,
    menus: menuRows.map((menu) => ({
      ...menu,
      categories: categoryRows.filter((category) => category.menu_id === menu.id).map((category) => ({
        ...category,
        items: (items ?? []).filter((item) => item.category_id === category.id),
      })),
    })),
  };

  return <MenuEditor initialData={initialData} />;
}
