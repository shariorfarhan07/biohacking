// Client-side API wrapper. Used exclusively from Client Components.
// - Always sends credentials so httpOnly session cookies travel with the request.
// - Always sets X-Requested-With on every call (required CSRF mitigation header).
// - Throws a typed ApiError on any non-2xx response so callers can render
//   ErrorState / toasts consistently instead of leaking raw fetch errors.

// Left unset in deployments where the backend has no public origin of its
// own: the browser then calls this page's own origin, and next.config.js's
// rewrite forwards /api/* to the backend over the internal Docker network.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_URL}/api${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query } = options;
  const isMutating = method !== "GET";

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      credentials: "include",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(isMutating ? { "X-Requested-With": "fetch" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(0, "Unable to reach the server. Please check your connection and try again.");
  }

  if (response.status === 204) {
    return {} as T;
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (payload && (payload.message || payload.detail || payload.error)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  return (payload ?? ({} as T)) as T;
}

export const apiClient = {
  get: <T>(path: string, query?: RequestOptions["query"]) => request<T>(path, { method: "GET", query }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ---- Typed resource helpers ----

import type {
  AdminCustomerDetail,
  AdminCustomerListResponse,
  AdminTicketListItem,
  AdminUser,
  AssignmentRule,
  AssignmentRuleTestResult,
  BlogPost,
  CheckoutSessionResponse,
  CheckoutStatusResponse,
  DevCheckoutSessionResponse,
  ContactMessage,
  Customer,
  DashboardResponse,
  DiscountCode,
  EverfitStatusResponse,
  OnboardingState,
  Package,
  PortalSessionResponse,
  Programme,
  RequiresAttentionResponse,
  Ticket,
  TicketDetail,
  TicketStatus,
} from "./types";

export const authApi = {
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
  }) => apiClient.post<Customer>("/auth/register", data),
  login: (data: { email: string; password: string; remember_me: boolean }) =>
    apiClient.post<Customer>("/auth/login", data),
  logout: () => apiClient.post<void>("/auth/logout"),
  me: () => apiClient.get<Customer>("/auth/me"),
  updateMe: (data: { first_name: string; last_name: string }) =>
    apiClient.patch<Customer>("/auth/me", data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    apiClient.post<{ message: string }>("/auth/change-password", data),
  requestPasswordReset: (data: { email: string }) =>
    apiClient.post<{ message: string }>("/auth/password-reset/request", data),
  confirmPasswordReset: (data: { token: string; new_password: string }) =>
    apiClient.post<{ message: string }>("/auth/password-reset/confirm", data),
};

export const adminAuthApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post<AdminUser>("/admin/auth/login", data),
  logout: () => apiClient.post<void>("/admin/auth/logout"),
  me: () => apiClient.get<AdminUser>("/admin/auth/me"),
};

export const packagesApi = {
  list: () => apiClient.get<Package[]>("/packages"),
  get: (slug: string) => apiClient.get<Package>(`/packages/${slug}`),
};

export const blogApi = {
  list: () => apiClient.get<BlogPost[]>("/blog"),
  get: (slug: string) => apiClient.get<BlogPost>(`/blog/${slug}`),
};

export const checkoutApi = {
  createSession: (data: { package_id: string; discount_code?: string }) =>
    apiClient.post<CheckoutSessionResponse>("/checkout/session", data),
  getStatus: (sessionId: string) =>
    apiClient.get<CheckoutStatusResponse>(`/checkout/session/${sessionId}/status`),
  // Dev-only: skips Stripe entirely. The backend 404s this outside a
  // non-production environment, so it's inert if ever called in prod.
  createDevSession: (data: { package_id: string; discount_code?: string }) =>
    apiClient.post<DevCheckoutSessionResponse>("/checkout/dev-session", data),
};

export const billingApi = {
  createPortalSession: () => apiClient.post<PortalSessionResponse>("/billing/portal-session"),
};

export const onboardingApi = {
  get: (membershipId: string) => apiClient.get<OnboardingState>(`/onboarding/${membershipId}`),
  saveStep: (membershipId: string, step: number, data: Record<string, unknown>) =>
    apiClient.patch<OnboardingState>(`/onboarding/${membershipId}/step`, { step, data }),
  complete: (membershipId: string) =>
    apiClient.post<{ membership_status: string; everfit_status: string }>(
      `/onboarding/${membershipId}/complete`
    ),
};

export const everfitApi = {
  status: () => apiClient.get<EverfitStatusResponse>("/everfit/status"),
};

export const dashboardApi = {
  get: () => apiClient.get<DashboardResponse>("/dashboard"),
};

export const ticketsApi = {
  list: () => apiClient.get<Ticket[]>("/tickets"),
  create: (data: { subject: string; message: string }) =>
    apiClient.post<TicketDetail>("/tickets", data),
  get: (id: string) => apiClient.get<TicketDetail>(`/tickets/${id}`),
  reply: (id: string, body: string) =>
    apiClient.post<TicketDetail>(`/tickets/${id}/messages`, { body }),
  resolve: (id: string) => apiClient.post<TicketDetail>(`/tickets/${id}/resolve`),
};

export const adminTicketsApi = {
  list: (status?: TicketStatus) =>
    apiClient.get<AdminTicketListItem[]>("/admin/tickets", status ? { status } : undefined),
  get: (id: string) => apiClient.get<TicketDetail>(`/admin/tickets/${id}`),
  reply: (id: string, body: string) =>
    apiClient.post<TicketDetail>(`/admin/tickets/${id}/messages`, { body }),
  updateStatus: (id: string, status: TicketStatus) =>
    apiClient.patch<TicketDetail>(`/admin/tickets/${id}/status`, { status }),
};

export const contactApi = {
  send: (data: { name: string; email: string; subject: string; message: string }) =>
    apiClient.post<{ message: string }>("/contact", data),
};

export const adminCustomersApi = {
  list: (query: { status?: string; search?: string; page?: number; page_size?: number }) =>
    apiClient.get<AdminCustomerListResponse>("/admin/customers", query),
  get: (membershipId: string) =>
    apiClient.get<AdminCustomerDetail>(`/admin/customers/${membershipId}`),
  requiresAttention: () =>
    apiClient.get<RequiresAttentionResponse>("/admin/customers/requires-attention"),
  refund: (membershipId: string, data: { reason: string; cancel_subscription: boolean }) =>
    apiClient.post<{ status: string }>(`/admin/customers/${membershipId}/refund`, data),
  overrideProgramme: (membershipId: string, data: { programme_id: string; reason: string }) =>
    apiClient.post<{ status: string }>(
      `/admin/customers/${membershipId}/override-programme`,
      data
    ),
  correctStatus: (membershipId: string, data: { status: string; reason: string }) =>
    apiClient.patch<{ status: string }>(`/admin/customers/${membershipId}/status`, data),
  retryEverfit: (membershipId: string) =>
    apiClient.post<{ status: string }>(`/admin/customers/${membershipId}/everfit/retry`),
};

export const adminProgrammesApi = {
  list: () => apiClient.get<Programme[]>("/admin/programmes"),
  create: (data: Partial<Programme>) => apiClient.post<Programme>("/admin/programmes", data),
  update: (id: string, data: Partial<Programme>) =>
    apiClient.patch<Programme>(`/admin/programmes/${id}`, data),
};

export const adminPackagesApi = {
  list: () => apiClient.get<Package[]>("/admin/packages"),
  get: (id: string) => apiClient.get<Package>(`/admin/packages/${id}`),
  create: (data: Partial<Package>) => apiClient.post<Package>("/admin/packages", data),
  update: (id: string, data: Partial<Package>) =>
    apiClient.patch<Package>(`/admin/packages/${id}`, data),
};

export const adminAssignmentRulesApi = {
  list: () => apiClient.get<AssignmentRule[]>("/admin/assignment-rules"),
  create: (data: Partial<AssignmentRule>) =>
    apiClient.post<AssignmentRule>("/admin/assignment-rules", data),
  update: (id: string, data: Partial<AssignmentRule>) =>
    apiClient.patch<AssignmentRule>(`/admin/assignment-rules/${id}`, data),
  remove: (id: string) => apiClient.delete<void>(`/admin/assignment-rules/${id}`),
  test: (data: { answers: Record<string, unknown> }) =>
    apiClient.post<AssignmentRuleTestResult>("/admin/assignment-rules/test", data),
};

export const adminDiscountCodesApi = {
  list: () => apiClient.get<DiscountCode[]>("/admin/discount-codes"),
  create: (data: Partial<DiscountCode>) =>
    apiClient.post<DiscountCode>("/admin/discount-codes", data),
  update: (id: string, data: Partial<DiscountCode>) =>
    apiClient.patch<DiscountCode>(`/admin/discount-codes/${id}`, data),
};

export const adminContactMessagesApi = {
  list: () => apiClient.get<ContactMessage[]>("/admin/contact-messages"),
};

export const adminBlogApi = {
  list: () => apiClient.get<BlogPost[]>("/admin/blog"),
  get: (id: string) => apiClient.get<BlogPost>(`/admin/blog/${id}`),
  create: (data: Partial<BlogPost>) => apiClient.post<BlogPost>("/admin/blog", data),
  update: (id: string, data: Partial<BlogPost>) =>
    apiClient.patch<BlogPost>(`/admin/blog/${id}`, data),
  remove: (id: string) => apiClient.delete<void>(`/admin/blog/${id}`),
};
