// ============================================================
// GOOGLE DOC SOURCES — which Doc feeds each page
// ============================================================
//
// Doc IDs are used by apps-script/content-api when publishing.
// The Netlify build reads the published JSON under src/content/docs/
// (not Google live), because Workspace blocks anonymous web app access.
//
// docId comes from:
//   https://docs.google.com/document/d/<THIS_PART>/edit

export interface DocSource {
  docId?: string;
  /** Optional fallback for public publish-to-web (usually unused). */
  pubUrl?: string;
}

export const DOC_SOURCES: Record<string, DocSource> = {
  announcements: { docId: '1qaVGUAixK7KhNGMW3cSsEpygUNpcMoSXRq_R5Ker1mA' },
  archives: { docId: '1ebPBsCehXgVX95XsrIGUosD9_7GSkPPHVJacdQoZBk8' },
  workExpectations: { docId: '1JVL93UxzBDSioh2vudp2pXd5jbTw-QnCs02gA-Ml3ds' },
  scheduling: { docId: '1qtkd37RGpW55OiFxZ5maWpMP3W7phWGTUW-l8hKT08Q' },
  fraudFlags: { docId: '1YUIZsNcBtFMx9Dmr-x_k38XIKRb7qEmHDQSDbQHZsVs' },
  documentation: { docId: '1yakDziTqEa5W-87FJdC1W-0dAMjmdhvDY8_OVfIETN8' },
  microTrainings: { docId: '1LX7UzMhZVDHX-HgdjIpXdFtahv-n9c88_Sto66FpWMU' },
  trainingMaterials: { docId: '1huNE5Yf-qaoR2oNEOAMuVA3SAUqq0s_IZtwV1bl4HTE' },
};
