// Domains blocked from the Brief's web_search tool.
//
// Selection basis: outlets classified by Ad Fontes Media as heavily
// analysis/opinion/commentary (lower reliability band on their
// interactive media bias chart), balanced across the left/right axis
// so the list is not ideologically curated. Wire services and
// straight-news outlets are handled by prompt guidance, not by an
// allow-list, so niche/local/regional topic coverage stays viable.
//
// Ad Fontes reranks periodically — sanity-check against
// https://adfontesmedia.com/interactive-media-bias-chart/ before
// adding or removing names. Entries must be bare domains with no
// scheme (Anthropic web_search rejects schemes; paths are optional).
const OPINION_OUTLETS = [
  // Left / left-leaning, opinion-heavy
  "jacobin.com",
  "thenation.com",
  "motherjones.com",
  "alternet.org",
  "salon.com",
  "rawstory.com",
  "dailykos.com",
  "commondreams.org",
  "truthout.org",
  "palmerreport.com",
  "occupydemocrats.com",
  "crooksandliars.com",

  // Right / right-leaning, opinion-heavy
  "breitbart.com",
  "theblaze.com",
  "dailywire.com",
  "dailycaller.com",
  "townhall.com",
  "redstate.com",
  "pjmedia.com",
  "thefederalist.com",
  "washingtontimes.com",
  "newsmax.com",
  "oann.com",
  "gatewaypundit.com",

  // Cross-spectrum / conspiracy-adjacent
  "infowars.com",
  "naturalnews.com",
  "zerohedge.com",
];

// Low-authority AI/tech aggregator sites that repackage other outlets'
// reporting under their own domain, then get surfaced heavily on
// AI-topic web searches.
//
// Selection basis: DIFFERENT from the OPINION_OUTLETS list above —
// these are NOT Ad Fontes-classified, NOT opinion-heavy, and NOT
// politically framed. They were identified empirically during live
// testing of the Brief feature on 2026-09-01, where AI-topic queries
// repeatedly returned them as top results and cited them in place of
// actual tech-beat reporting (TechCrunch, The Verge, Ars Technica,
// Reuters). The prompt's outlet-preference bullet could not out-vote
// the raw search density, so they're blocked at the API layer.
//
// Add to this list ONLY when a new aggregator shows up in live output
// crowding out primary reporting on a specific beat — do not add
// speculatively, and do not conflate this bucket with the opinion-
// outlet bucket above (different sourcing basis, different rationale,
// different maintenance cadence).
const LOW_AUTHORITY_AGGREGATORS = [
  "aiweekly.co",
  "aitoolsrecap.com",
  "aiagentstore.ai",
];

export const BLOCKED_DOMAINS = [
  ...OPINION_OUTLETS,
  ...LOW_AUTHORITY_AGGREGATORS,
];
