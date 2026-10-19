// Map navigation paths to your routes and back, so the bar follows the URL (and the browser's back button).
import { VSP360_NAVIGATION, type NavItem, type NavMenuItem, type NavPath } from "@nextds/navigation";

// "/analytics/capacity/storage/block" <-> ["analytics", "Capacity", "Storage", "Block"]
const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const pathToUrl = (path: NavPath) => "/" + path.filter(Boolean).map(slug).join("/");

/** Finds the path whose URL matches, among all the paths of your navigation (see allPaths). */
export const urlToPath = (url: string, paths: NavPath[]) => paths.find((p) => pathToUrl(p) === url) || null;

/** Every selectable path of a navigation, for urlToPath and for checking your routes. */
export function allPaths(items: NavItem[] = VSP360_NAVIGATION): NavPath[] {
  const out: NavPath[] = [];
  const walk = (n: { items?: NavMenuItem[]; groups?: [string | null, string[]][] }, pre: NavPath) => {
    if (n.groups) n.groups.forEach(([g, pages]) => pages.forEach((p) => out.push([...pre, g || "", p])));
    else (n.items || []).forEach((it) => (it.items || it.groups ? walk(it, [...pre, it.label]) : !it.external && out.push([...pre, it.label])));
  };
  items.forEach((it) => (it.menu ? walk(it.menu as any, [it.key]) : out.push([it.key])));
  return out;
}
