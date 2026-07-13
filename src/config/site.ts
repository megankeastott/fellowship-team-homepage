// ============================================================
// SITE CONFIG — routes, nav, and Google Doc sources
// ============================================================
//
// This is the map of the whole site. It mirrors the old Apps Script
// ROUTES/NAV_ITEMS, but now drives a static Astro build.
//
// To wire a page to its Google Doc, fill in `docId` OR `pubUrl` below
// (see src/config/docs.ts). Until then, the page shows a friendly
// "not wired up yet" placeholder instead of erroring.

export type RealmColor =
  | 'shire'
  | 'hearth'
  | 'evenstar'
  | 'earthen'
  | 'shadow'
  | 'twilight';

export type RouteKind = 'home' | 'doc' | 'hub' | 'team-hub';

export interface RouteBase {
  /** URL slug. 'home' maps to "/". */
  slug: string;
  kind: RouteKind;
  title: string;
}

export interface DocRoute extends RouteBase {
  kind: 'doc';
  /** Key into DOC_SOURCES (src/config/docs.ts). */
  docKey: string;
  /** Optional decorative icon key shown by section headers. */
  sectionAsset?: string;
  /** Parent slug for the breadcrumb "back" link. */
  parent?: string;
  color?: RealmColor;
  archive?: boolean;
}

export interface HubRoute extends RouteBase {
  kind: 'hub';
  sectionAsset?: string;
  children: string[];
  description?: string;
}

export interface SimpleRoute extends RouteBase {
  kind: 'home' | 'team-hub';
}

export type Route = DocRoute | HubRoute | SimpleRoute;

export const ROUTES: Route[] = [
  { slug: 'home', kind: 'home', title: 'Home' },

  {
    slug: 'announcements',
    kind: 'doc',
    title: 'Announcements',
    docKey: 'announcements',
    sectionAsset: 'candle',
  },
  {
    slug: 'archives',
    kind: 'doc',
    title: 'The Archives',
    docKey: 'archives',
    sectionAsset: 'candle',
    archive: true,
    parent: 'announcements',
  },

  {
    slug: 'reminders',
    kind: 'hub',
    title: 'Reminders',
    sectionAsset: 'tome',
    children: ['work-expectations', 'scheduling', 'fraud-flags'],
  },
  {
    slug: 'work-expectations',
    kind: 'doc',
    title: 'Work Expectations',
    docKey: 'workExpectations',
    parent: 'reminders',
    color: 'hearth',
  },
  {
    slug: 'scheduling',
    kind: 'doc',
    title: 'Scheduling & Time Off',
    docKey: 'scheduling',
    parent: 'reminders',
    color: 'evenstar',
  },
  {
    slug: 'fraud-flags',
    kind: 'doc',
    title: 'Fraud Flags',
    docKey: 'fraudFlags',
    parent: 'reminders',
    color: 'shadow',
  },

  {
    slug: 'resources',
    kind: 'hub',
    title: 'Resources',
    sectionAsset: 'tome',
    children: ['documentation', 'micro-trainings', 'training-materials'],
  },
  {
    slug: 'documentation',
    kind: 'doc',
    title: 'Documentation',
    docKey: 'documentation',
    parent: 'resources',
    color: 'evenstar',
  },
  {
    slug: 'micro-trainings',
    kind: 'doc',
    title: 'Micro Trainings',
    docKey: 'microTrainings',
    parent: 'resources',
    color: 'shire',
  },
  {
    slug: 'training-materials',
    kind: 'doc',
    title: 'Training Materials',
    docKey: 'trainingMaterials',
    parent: 'resources',
    color: 'earthen',
  },

  { slug: 'team-hub', kind: 'team-hub', title: 'The Shire — Team Hub' },
];

// Short descriptions for the hub landing cards.
export const HUB_CHILD_DESCRIPTIONS: Record<string, string> = {
  'work-expectations': 'Hours, attendance, conduct, and core team expectations.',
  scheduling: 'How to request time off, shift swaps, and schedule changes.',
  'fraud-flags': 'Red flags to watch for and what to do when you spot them.',
  documentation: 'Reference docs, process guides, and procedural how-tos.',
  'micro-trainings': 'Short, focused training modules — quick wins.',
  'training-materials': 'Onboarding materials and longer-form training content.',
};

// Top navigation row (same on every page). Order = left to right.
export const NAV_ITEMS: { slug: string; label: string }[] = [
  { slug: 'home', label: 'Home' },
  { slug: 'announcements', label: 'Announcements' },
  { slug: 'reminders', label: 'Reminders' },
  { slug: 'resources', label: 'Resources' },
  { slug: 'team-hub', label: 'Team Hub' },
  { slug: 'archives', label: 'The Archives' },
];

// External links that live outside this site.
export const EXTERNAL = {
  // Paste the Bingo deployment URL here (or leave empty to hide the link).
  bingoUrl: '',
};

export function routeUrl(slug: string): string {
  return slug === 'home' ? '/' : `/${slug}`;
}

export function getRoute(slug: string): Route | undefined {
  return ROUTES.find((r) => r.slug === slug);
}

export const VALID_COLORS: RealmColor[] = [
  'shire',
  'hearth',
  'evenstar',
  'earthen',
  'shadow',
  'twilight',
];
