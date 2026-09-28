export const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    ME: "/api/auth/me",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },
  BUSINESSES: {
    CREATE_BUSINESS: "/api/businesses",
    GET_MY_BUSINESS: "/api/businesses/private",
    GET_PRIVATE_PROFILE: "/api/businesses/private",
    GET_PUBLIC_PROFILE: (slug) => `/api/businesses/public/${slug}`,
    UPDATE_SETTINGS: "/api/businesses/settings",
  },
  REVIEWS: {
    CREATE_REVIEW: "/api/reviews",
    LIST: "/api/reviews",
    GET_PUBLIC_REVIEWS: (businessId) => `/api/reviews/public/${businessId}`,
    APPROVE_REVIEW: (id) => `/api/reviews/${id}/status`,
    REJECT_REVIEW: (id) => `/api/reviews/${id}/status`,
    DELETE_REVIEW: (id) => `/api/reviews/${id}`,
  },
  WIDGETS: {
    GET_WIDGETS: "/api/widgets",
    CREATE_WIDGET: "/api/widgets",
    UPDATE_WIDGET: (id) => `/api/widgets/${id}`,
    DELETE_WIDGET: (id) => `/api/widgets/${id}`,
  },
  NOTIFICATIONS: {
    LIST: "/api/notifications",
    UNREAD_COUNT: "/api/notifications/unread-count",
    MARK_ALL_READ: "/api/notifications/read-all",
    MARK_AS_READ: (id) => `/api/notifications/${id}/read`,
    CLEAR_ALL: "/api/notifications/clear",
    DELETE: (id) => `/api/notifications/${id}`,
  },
  DASHBOARD: {
    OVERVIEW: "/api/dashboard/overview",
    RECENT_REVIEWS: "/api/dashboard/recent-reviews",
  },
  ANALYTICS: {
    SUMMARY: "/api/analytics/summary",
    SENTIMENT_DISTRIBUTION: "/api/analytics/sentiment-distribution",
    RATING_DISTRIBUTION: "/api/analytics/rating-distribution",
    TIMESERIES: "/api/analytics/timeseries",
    KEYWORDS: "/api/analytics/keywords",
  },
  MEDIA: {
    UPLOAD: "/api/media/upload",
    STORAGE_STATUS: "/api/media/storage-status",
  },
  BILLING: {
    GET_BILLING_ACCOUNT: "/api/billing/account",
    SELECT_PLAN: "/api/billing/select-plan",
    GET_PRICING_PLANS: "/api/billing/plans",
    GET_STORAGE_STATUS: "/api/billing/storage-status",
    GET_INVOICES: "/api/billing/invoices",
    CREATE_CHECKOUT_SESSION: "/api/billing/checkout",
    CREATE_PORTAL_SESSION: "/api/billing/portal",
    DOWNLOAD_INVOICE: (id) => `/api/billing/invoices/${id}/download`,
  },
  VALIDATION: {
    CHECK_SLUG_AVAILABILITY: (slug) => `/api/validation/slug/check/${slug}`,
    SUGGEST_SLUG: (name) => `/api/validation/slug/suggest?name=${name}`,
  },
};


