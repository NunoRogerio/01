// Types for @nextds/navigation — the NEXT Design System navigation for React.
import type { ReactNode, ReactElement, CSSProperties } from "react";

/** The NEXT themes. */
export type Theme = "dawn" | "wicked";
/** A page of a menu: a 2nd level when it has `items` or `groups`; `external` opens outside the app (never selected). */
export interface NavMenuItem {
  label: string;
  items?: NavMenuItem[];
  groups?: NavMenuGroup[];
  external?: boolean;
}
/** A category of pages: its label (or null for pages after a rule, without label) and the page names. */
export type NavMenuGroup = [label: string | null, pages: string[]];
/** A section's drill-down menu: a list of pages, or pages in categories. */
export type NavMenu = { items: NavMenuItem[] } | { groups: NavMenuGroup[] };
/** A section of the bar. `icon`: a built-in icon name (dashboard, inventory, analytics, protection, orchestration, monitoring, administration) or your own 16px element. */
export interface NavItem {
  key: string;
  label: string;
  icon?: string | ReactNode;
  /** Without a menu, the section is a page itself. */
  menu?: NavMenu;
}
/** The selected page, from the section key down: e.g. ["analytics", "Capacity", "Storage", "Block"] ("" for pages without a category label). */
export type NavPath = string[];

export interface NavigationProps {
  /** Default: the VSP 360 navigation. */
  items?: NavItem[];
  value?: NavPath;
  defaultValue?: NavPath;
  onNavigate?: (path: NavPath) => void;
  /** An external page was clicked (e.g. Ansible). */
  onExternal?: (path: NavPath) => void;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  theme?: Theme;
  className?: string;
  style?: CSSProperties;
}
/** The vertical navigation bar: 271px open, 77px collapsed, drill-down menus inside the bar. Give it the full height of the app body. */
export declare function Navigation(props: NavigationProps): ReactElement;

export interface AppHeaderProps {
  /** The app name, after the Hitachi logo. Default "VSP 360". */
  app?: string;
  /** The account's initials, in the avatar. */
  initials?: string;
  onHelp?: () => void;
  onApps?: () => void;
  onAccount?: () => void;
  theme?: Theme;
  className?: string;
  style?: CSSProperties;
}
/** The 56px app header: Hitachi logo, app name, help, apps and account. */
export declare function AppHeader(props: AppHeaderProps): ReactElement;

/** The VSP 360 navigation, as drawn. */
export declare const VSP360_NAVIGATION: NavItem[];
/** The labels of a path, for a breadcrumb or a title. */
export declare function navPathLabels(path: NavPath, items?: NavItem[]): string[];
