import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom', // en vez de jsdom
    globals: true,
  },
});
