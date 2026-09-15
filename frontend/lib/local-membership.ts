// Best-effort client-side cache of the customer's most recent membership id.
//
// The API contract's GET /dashboard response intentionally does not expose a
// membership_id (only status/package/billing summaries), so there is no
// endpoint to look it up later. To let "Resume onboarding" deep-link straight
// into /onboarding/{membershipId}/{step} on a return visit, we remember the
// id locally whenever we learn it (checkout success, any onboarding step).
// This is purely a UX convenience — if it's unavailable (new device, cleared
// storage) the dashboard falls back to directing the customer to support.
const STORAGE_KEY = "biohacking_membership_id";

export function saveMembershipId(id: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore — localStorage may be unavailable (private browsing, etc.)
  }
}

export function getStoredMembershipId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
