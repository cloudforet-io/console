import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
    './apps/web/vite.config.js',
    './packages/mirinae/vite.config.js',
    './packages/core-lib/vite.config.js',
    './packages/utils/vite.config.js',
]);
