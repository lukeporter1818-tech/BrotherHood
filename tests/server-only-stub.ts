// Empty stub for the `server-only` package under Vitest. The real package
// throws at import time to prevent client bundles from including server code;
// Vitest runs in Node with no bundler swap, so it would trip that guard.
export {};
