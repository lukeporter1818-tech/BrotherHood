// Load .env.local (then .env as fallback) so real-API integration tests see
// ANTHROPIC_API_KEY. Next.js loads these automatically for the app; Vitest
// does not, so we wire it up explicitly for the integration config.
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });
