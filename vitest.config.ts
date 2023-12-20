import { defineConfig } from 'vitest/config'

export default defineConfig({
  server: {
    port: 5172,
  },
  test: {
    env: {
      TEST_E: 'test@test.com',
      TEST_P: 'test',
    },
    browser: {
      enabled: true,
      name: 'chrome',
      slowHijackESM: true,
      // headless: true,
    },
    environmentMatchGlobs: [
      ['src/lib/tests/dom/**', 'jsdom'], // Use browser environment for tests in the dom folder
    ],
  },
})
