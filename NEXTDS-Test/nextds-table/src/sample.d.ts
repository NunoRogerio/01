// Types for @nextds/table/sample — made-up storage systems to try the table.
import type { TableColumn, TableRow, TableQuery, SortModel } from "./index";

export interface StorageSystemRow extends TableRow {
  id: number;
  health: "Normal" | "Warning" | "Critical";
  name: string;
  model: string;
  site: string;
  usedPct: number;
  alerts: number;
  serial: string;
  totalTB: number;
  iops: number;
  latency: number;
  microcode: string;
}

export declare const storageSystemsColumns: TableColumn<StorageSystemRow>[];
export declare const storageSystemsRows: StorageSystemRow[];
/** Ready to spread on the table: <DataTable {...storageSystems} /> */
export declare const storageSystems: {
  title: string;
  columns: TableColumn<StorageSystemRow>[];
  rows: StorageSystemRow[];
  initialSort: SortModel;
  addLabel: string;
};

/** Answers a table query like an API would: search, filter, sort, page. */
export declare function querySample<R extends TableRow = StorageSystemRow>(
  query: TableQuery, rows?: R[], columns?: TableColumn<R>[]
): { rows: R[]; total: number };
/** querySample behind a delay, like a network call. */
export declare function fetchSample(query: TableQuery, delayMs?: number): Promise<{ rows: StorageSystemRow[]; total: number }>;
