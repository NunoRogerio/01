// Types for @nextds/table — the NEXT Design System table for React.
import type { ReactNode, ReactElement } from "react";

/** A row: any object with a unique `id`. Other fields are read by column `key`. */
export interface TableRow {
  id: string | number;
  /** Shown as a definition list when the row is expanded (if `renderDetail` is not given). */
  details?: Record<string, ReactNode>;
  [field: string]: unknown;
}

export type ColumnType = "string" | "number" | "singleSelect";
/** Status tags (Normal, Warning, Critical…): maps a cell value to its status kind. */
export type StatusKind = "positive" | "warning" | "negative" | "info";

export interface TableColumn<R extends TableRow = TableRow> {
  /** Field of the row shown in this column. Unique per table. */
  key: string;
  /** Column title. */
  title: string;
  /** Decides the filter operators. Default "string". */
  type?: ColumnType;
  /** The values offered by the filters' value lists. Required in server mode (the table only sees one page). */
  options?: Array<string | number>;
  /** Shows each value as a status tag, e.g. { Normal: "positive", Warning: "warning", Critical: "negative" }. */
  status?: Record<string, StatusKind>;
  /** Shows each value as a categorical tag; an object maps values to one of the 12 categorical colours (1–12). */
  tag?: boolean | Record<string, number>;
  /** Text shown for a value (also used by search). */
  format?: (value: R[keyof R] | any) => string;
  /** Right-aligns the column (numbers). */
  align?: "left" | "right";
  /** false: the title does not sort. Default true. */
  sortable?: boolean;
  /** false: the field is not entered by people (a metric the system reports, for example): it is read-only in the edit panel
   *  and not asked in the add panel. Adding asks every other field and enables Apply once all are filled. */
  editable?: boolean;
  /** Draws the cell yourself (links, icons, bars, several fields…). Search, filters and sorting still use the row's value at `key`,
   *  and `format` still gives the text that search matches. Takes priority over `status` and `tag`. */
  render?: (row: R, value: any) => ReactNode;
  /** A micro chart in each cell. The row's value at `key` is a list of numbers, oldest first.
   *  "trend": a line. "area": a line over a soft fill. "bar": one horizontal bar of the latest value, from 0 to `vizMax`.
   *  The column is not searched or filtered; set `sortable: false`. */
  viz?: "trend" | "area" | "bar";
  /** The top of the "bar" micro chart. Default 100. */
  vizMax?: number;
  /** The text of the metric shown on the left of every micro chart (the latest value). Default: the number as it is. */
  vizFormat?: (latest: number) => string;
}

/** Filter model, the same shape as the MUI X Data Grid GridFilterModel. */
export interface FilterItem {
  id: string | number;
  field: string;
  /** string: contains, doesNotContain, equals, doesNotEqual, startsWith, endsWith, isEmpty, isNotEmpty, isAnyOf, isNoneOf;
   *  number: =, !=, >, >=, <, <=, isEmpty, isNotEmpty, isAnyOf, isNoneOf;
   *  singleSelect: is, not, isAnyOf, isNoneOf */
  operator: string;
  value?: unknown;
}
export interface FilterModel {
  items: FilterItem[];
  logicOperator?: "and" | "or";
  /** Search terms typed in the table's search field. */
  quickFilterValues?: string[];
  quickFilterLogicOperator?: "and" | "or";
}

export interface SortModel {
  key: string;
  dir: "asc" | "desc";
}

/** What the table asks for in server mode. */
export interface TableQuery {
  /** 1-based page number. */
  page: number;
  pageSize: number;
  sort: { field: string; direction: "asc" | "desc" } | null;
  /** Only complete conditions; choices of "every value" are left out. */
  filterModel: Required<Pick<FilterModel, "items" | "logicOperator" | "quickFilterValues" | "quickFilterLogicOperator">>;
}

export interface RowsChange<R extends TableRow = TableRow> {
  type: "add" | "edit" | "delete";
  row: R;
}

export interface TableError {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export interface EmptyState {
  title?: string;
  /** Text at the right of the title (e.g. a count or a short note). */
  description?: ReactNode;
  /** An information icon after the title; its text shows as a tooltip. A header has a description or an info icon, not both: with a description, `info` is ignored. */
  info?: string;
  message?: string;
  actions?: Array<{ label: string; onClick: () => void }>;
}

export interface DataTableProps<R extends TableRow = TableRow> {
  /* ---------- data ---------- */
  columns: TableColumn<R>[];
  rows: R[];
  /** "client" (default): the table searches, filters, sorts and pages `rows`.
   *  "server": `rows` is the current page; the table calls `onQueryChange` and shows `rowCount` as the total. */
  dataMode?: "client" | "server";
  /** Server mode: the total number of rows that match the query. */
  rowCount?: number;
  /** Server mode: called on load and on every change of page, page size, sort, filters or search. Fetch and pass the new `rows` / `rowCount`. */
  onQueryChange?: (query: TableQuery) => void;
  /** Shows skeleton rows. */
  loading?: boolean;
  /** Shows an error banner above the rows. */
  error?: TableError | null;
  /** Texts and actions when there are no rows at all. */
  emptyState?: EmptyState | null;

  /* ---------- look ---------- */
  /** Theme of the NEXT library. Default "dawn". */
  theme?: "dawn" | "wicked";
  /** Default "comfortable". */
  density?: "comfortable" | "balanced" | "compact";
  /** Overrides of the CSS tokens, e.g. { "--component-containerradius": "4px" }. */
  tokens?: Record<string, string>;
  /** Space between rows, in px. Default 12. */
  rowGap?: number;
  /** Corner radius of the rows, in px. Default 8. */
  containerRadius?: number;
  /** "auto": columns follow the table width; "equal": equal columns. */
  columnLayout?: "auto" | "equal";
  columnMinWidth?: number;

  /* ---------- header ---------- */
  title?: string;
  showTitle?: boolean;
  searchEnabled?: boolean;
  /** "persistent": always open; "expandable": opens from the search icon. */
  searchMode?: "persistent" | "expandable";
  searchPlaceholder?: string;
  searchDebounceMs?: number;
  searchDisabled?: boolean;
  searchError?: string;
  /** Recent searches offered when the field is empty. */
  searchRecent?: string[];
  showFilterButton?: boolean;
  showMaximize?: boolean;
  /** Export, column configuration, density and advanced options. */
  showMoreOptions?: boolean;

  /* ---------- filters ---------- */
  /** "group": fields on the left, values on the right; "rows": one condition per line (MUI style). Default "group". */
  filterUi?: "group" | "rows";
  showFilterBar?: boolean;
  initialFilterModel?: FilterModel;
  onFilterModelChange?: (model: FilterModel) => void;
  onFilterBarChange?: (open: boolean) => void;

  /* ---------- sort and pages ---------- */
  initialSort?: SortModel | null;
  showPagination?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  scrollbarHorizontal?: boolean;
  scrollbarVertical?: boolean;
  /** Rows visible with vertical scroll. */
  visibleRows?: number;

  /* ---------- columns ---------- */
  pinnedColumns?: string[];
  onPinnedChange?: (keys: string[]) => void;
  columnReorder?: boolean;
  onColumnOrderChange?: (keys: string[]) => void;
  columnResize?: boolean;
  onColumnResize?: (widths: Record<string, number>) => void;
  /** "latest": one list with check boxes and pins; "legacy": Fixed / Visible / Hidden lists. */
  columnConfig?: "latest" | "legacy";
  onColumnsChange?: (columns: { fixed: string[]; visible: string[]; hidden: string[] }) => void;
  onDensityChange?: (density: "comfortable" | "balanced" | "compact") => void;

  /* ---------- rows ---------- */
  selectable?: boolean;
  onSelectionChange?: (ids: Array<TableRow["id"]>) => void;
  onBulkAction?: (action: "edit" | "delete", ids: Array<TableRow["id"]>) => void;
  expandable?: boolean;
  renderDetail?: (row: R) => ReactNode;
  /** The View button of each row. */
  rowView?: boolean;
  onView?: (row: R) => void;
  /** The row menu (…). */
  rowMenu?: boolean;
  onMore?: (row: R) => void;

  /* ---------- editing ---------- */
  editable?: boolean;
  showAdd?: boolean;
  addLabel?: string;
  addedMessage?: string;
  deleteMessage?: string;
  /** Called with the new rows after an add, edit or delete. */
  onRowsChange?: (rows: R[], change: RowsChange<R>) => void;

  /* ---------- other ---------- */
  onMaximizeChange?: (maximized: boolean) => void;
  /** Space kept free above the maximized table (e.g. an app header), in px. */
  maximizeTop?: number;
  /** The table only announces the export; the app creates the file. */
  onExport?: (format: string, rows: R[]) => void;
}

export declare function DataTable<R extends TableRow = TableRow>(props: DataTableProps<R>): ReactElement;
