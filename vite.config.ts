import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      // The repo layout keeps generated/hand-maintained data in config/ and
      // data/, which sit outside src/. Let the dev server read them.
      allow: [root]
    }
  }
});
