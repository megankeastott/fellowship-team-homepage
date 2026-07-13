// ============================================================
// GOOGLE DOC SOURCES — where each doc-driven page gets its content
// ============================================================
//
// Each entry can be wired up in ONE of two ways:
//
//   1. docId   — the ID from a normal doc URL:
//                https://docs.google.com/document/d/<THIS_PART>/edit
//                The doc must be shared so "Anyone with the link" can VIEW.
//
//   2. pubUrl  — the full "Publish to web" URL (File → Share → Publish to web):
//                https://docs.google.com/document/d/e/<LONG_ID>/pub
//
// Prefer `docId` when the doc is link-shared; use `pubUrl` when it is only
// published to web. If both are given, `pubUrl` wins.
//
// Leave a field empty ('') to show a friendly "not wired up yet" placeholder
// on that page instead of failing the build.

export interface DocSource {
  docId?: string;
  pubUrl?: string;
}

export const DOC_SOURCES: Record<string, DocSource> = {
  announcements: { docId: '', pubUrl: '' },
  archives: { docId: '', pubUrl: '' },
  workExpectations: { docId: '', pubUrl: '' },
  scheduling: { docId: '', pubUrl: '' },
  fraudFlags: { docId: '', pubUrl: '' },
  documentation: { docId: '', pubUrl: '' },
  microTrainings: { docId: '', pubUrl: '' },
  trainingMaterials: { docId: '', pubUrl: '' },
};
