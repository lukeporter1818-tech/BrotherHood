import * as Sentry from "@sentry/nextjs";

const NOISY_BREADCRUMB_CATEGORIES = new Set([
  "console",
  "fetch",
  "xhr",
  "navigation",
]);

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    queues: false,
    stackFrameVariables: false,
  },
  tracesSampleRate: 0.1,
  maxBreadcrumbs: 20,
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category && NOISY_BREADCRUMB_CATEGORIES.has(breadcrumb.category)) {
      return null;
    }
    return breadcrumb;
  },
  beforeSend(event) {
    if (event.request) {
      delete event.request.data;
      delete event.request.cookies;
      delete event.request.headers;
      delete event.request.query_string;
    }
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
