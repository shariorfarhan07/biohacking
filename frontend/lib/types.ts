// Shared types mirrored from the backend API contract.
// These are hand-maintained against the documented contract (no codegen),
// since the backend is developed independently.

export type MembershipStatus =
  | "pending_payment"
  | "onboarding_pending"
  | "onboarding_complete"
  | "provisioning"
  | "provisioned"
  | "provisioning_failed"
  | "payment_failed"
  | "canceled"
  | "refunded";

export type EverfitStatus =
  | "not_started"
  | "client_created"
  | "programme_assigned"
  | "activated"
  | "failed";

export type BillingInterval = "monthly" | "three_month" | "six_month" | "twelve_month";

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export interface Package {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  billing_interval: BillingInterval;
  features: string[];
  is_active: boolean;
  sort_order: number;
  stripe_price_id?: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
}

export interface DevCheckoutSessionResponse {
  membership_id: string;
  status: MembershipStatus;
}

export interface CheckoutStatusResponse {
  membership_id: string;
  status: MembershipStatus;
}

export interface PortalSessionResponse {
  portal_url: string;
}

export interface OnboardingState {
  membership_id: string;
  current_step: number;
  completed_at: string | null;
  goal?: string | null;
  target_weight_kg?: string | number | null;
  body_composition_goal?: string | null;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  body_fat_range?: string | null;
  training_experience?: string | null;
  training_days_per_week?: number | null;
  preferred_training_days?: string[];
  training_location?: string | null;
  equipment?: string[];
  session_duration_minutes?: number | null;
  occupation?: string | null;
  activity_level?: string | null;
  daily_steps?: number | null;
  sleep_hours?: number | null;
  sleep_quality?: string | null;
  stress_level?: string | null;
  current_calorie_intake?: number | null;
  food_preferences?: string[];
  allergies?: string | null;
  intolerances?: string | null;
  meals_per_day?: number | null;
  cooking_ability?: string | null;
  food_budget?: string | null;
  injuries?: string | null;
  physical_limitations?: string | null;
  health_screening_answers?: Record<string, boolean | string> | null;
  progress_photos_provided?: boolean;
}

export interface EverfitStatusResponse {
  status: EverfitStatus;
  programme_name?: string | null;
  access_url?: string | null;
  last_error?: string | null;
}

export interface DashboardResponse {
  customer: Customer;
  membership: {
    status: MembershipStatus;
    package_name: string;
    next_billing_date: string | null;
  };
  onboarding: {
    completed: boolean;
    current_step: number;
  };
  everfit: {
    status: EverfitStatus;
    programme_name: string | null;
    access_url: string | null;
  };
}

export interface AdminCustomerListItem {
  membership_id: string;
  customer_name: string;
  email: string;
  package_name: string;
  payment_status: MembershipStatus;
  onboarding_status: string;
  programme_name: string | null;
  everfit_status: EverfitStatus;
  created_at: string;
}

export interface AdminCustomerListResponse {
  items: AdminCustomerListItem[];
  total: number;
  page: number;
  page_size: number;
}

/** Mirrors the backend's flat `AdminCustomerDetail` schema exactly. */
export interface AdminCustomerDetail {
  membership_id: string;
  customer_id: string;
  customer_name: string;
  email: string;
  package: Package;
  membership_status: MembershipStatus;
  stripe_subscription_id: string | null;
  next_billing_date: string | null;
  activated_at: string | null;
  canceled_at: string | null;
  onboarding: OnboardingState | null;
  everfit_status: EverfitStatus;
  everfit_client_id: string | null;
  everfit_programme_name: string | null;
  everfit_access_url: string | null;
  everfit_last_error: string | null;
  everfit_attempt_count: number;
  created_at: string;
}

export interface RequiresAttentionItem {
  membership_id: string;
  customer_name: string;
  email: string;
  reason: string;
}

export interface RequiresAttentionResponse {
  items: RequiresAttentionItem[];
}

export interface Programme {
  id: string;
  name: string;
  slug: string;
  description: string;
  everfit_programme_id: string;
  is_active: boolean;
}

/**
 * The backend rules engine evaluates a JSON predicate tree: an `all`/`any` group
 * wrapping leaf conditions of `{field, op, value}`. Operators are the engine's
 * own vocabulary (eq, ne, in, not_in, gte, lte, gt, lt, between, contains).
 */
export type RuleOperator =
  | "eq"
  | "ne"
  | "in"
  | "not_in"
  | "gte"
  | "lte"
  | "gt"
  | "lt"
  | "between"
  | "contains";

export interface AssignmentRuleCondition {
  field: string;
  op: RuleOperator;
  value: string | number | Array<string | number>;
}

export type AssignmentRuleConditions =
  | { all: AssignmentRuleCondition[] }
  | { any: AssignmentRuleCondition[] };

export interface AssignmentRule {
  id: string;
  name: string;
  priority: number;
  conditions: AssignmentRuleConditions;
  programme_id: string;
  is_active: boolean;
}

export interface AssignmentRuleTestResult {
  matched_rule_id: string | null;
  matched_rule_name: string | null;
  programme: Programme | null;
  used_default_fallback: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  percent_off: number | null;
  amount_off_cents: number | null;
  is_active: boolean;
  expires_at: string | null;
  max_redemptions: number | null;
}

export type PostStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  cover_image_url: string | null;
  author_name: string;
  status: PostStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export type TicketStatus = "open" | "resolved";
export type TicketAuthorType = "customer" | "admin";

export interface TicketMessage {
  id: string;
  author_type: TicketAuthorType;
  author_name: string;
  body: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export interface TicketDetail extends Ticket {
  customer_name: string;
  customer_email: string;
  messages: TicketMessage[];
}

export interface AdminTicketListItem extends Ticket {
  customer_name: string;
  customer_email: string;
  message_count: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}
