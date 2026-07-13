// @ts-check
import { defineConfig } from 'astro/config';

// Static site. Content is pulled from published Google Docs at build time
// (see src/lib/googleDocs.ts) so the live site never depends on Google at
// request time. Re-run the build (or trigger a Netlify build hook) to pick
// up doc edits.
export default defineConfig({
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
  },
});
