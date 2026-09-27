# TODO

- Possible bug — `cache_control: { type: 'ephemeral' }` in `lib/goose/responder.ts:34` is passed at the request level, not attached to individual content blocks or the system prompt as Anthropic's API expects. Prompt caching on Goose may not actually be engaging. Worth auditing separately — not touched during the Daily-3-merge work.
