// Adapters: the table only knows flat rows with an `id`, and asks for data with a TableQuery.
// Keep the translation between your API and the table in one place, like this file.
import type { TableQuery, TableRow, FilterItem } from "@nextds/table";

/* ---------- 1. API record -> table row ---------- */
// Example API shape: nested, with its own id field and raw units.
export interface ApiSystem {
  serialNumber: string;
  name: string;
  model: { family: string; name: string };
  location?: { site?: string };
  capacity: { usedBytes: number; totalBytes: number };
  health: "OK" | "WARN" | "CRIT";
}
export interface SystemRow extends TableRow {
  id: string;
  name: string;
  model: string;
  site: string;
  usedPct: number;
  health: "Normal" | "Warning" | "Critical";
}
const HEALTH = { OK: "Normal", WARN: "Warning", CRIT: "Critical" } as const;

export function toRow(s: ApiSystem): SystemRow {
  return {
    id: s.serialNumber,                       // any unique, stable value
    name: s.name,
    model: s.model.name,                      // flatten nested fields
    site: s.location?.site ?? "",             // no undefined: filters and search expect values
    usedPct: Math.round((s.capacity.usedBytes / s.capacity.totalBytes) * 100), // store the number, show it with column.format
    health: HEALTH[s.health],                 // the words users see (and filter on)
  };
}

/* ---------- 2. TableQuery -> REST query string ---------- */
// The filter model has the MUI X Data Grid shape. Map each operator to what your API understands.
const OP: Record<string, string> = {
  contains: "like", doesNotContain: "nlike", equals: "eq", doesNotEqual: "ne", startsWith: "sw", endsWith: "ew",
  "=": "eq", "!=": "ne", ">": "gt", ">=": "gte", "<": "lt", "<=": "lte",
  is: "eq", not: "ne", isAnyOf: "in", isNoneOf: "nin", isEmpty: "null", isNotEmpty: "notnull",
};
// Column keys are the table's names; the API may name fields differently.
const FIELD: Record<string, string> = { usedPct: "capacity.usedPercent", site: "location.site" };

export function toSearchParams(q: TableQuery): URLSearchParams {
  const p = new URLSearchParams();
  p.set("page", String(q.page));              // 1-based
  p.set("pageSize", String(q.pageSize));
  if (q.sort) p.set("sort", `${q.sort.direction === "desc" ? "-" : ""}${FIELD[q.sort.field] ?? q.sort.field}`);
  q.filterModel.items.forEach((it: FilterItem) => {
    const field = FIELD[it.field] ?? it.field;
    const value = Array.isArray(it.value) ? it.value.join(",") : it.value ?? "";
    p.append("filter", `${field}:${OP[it.operator] ?? it.operator}:${value}`);
  });
  if (q.filterModel.items.length > 1) p.set("logic", q.filterModel.logicOperator);
  if (q.filterModel.quickFilterValues.length) p.set("q", q.filterModel.quickFilterValues.join(" "));
  return p;
}
