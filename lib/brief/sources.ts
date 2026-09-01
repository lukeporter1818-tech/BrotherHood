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
export const BLOCKED_DOMAINS = [
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
