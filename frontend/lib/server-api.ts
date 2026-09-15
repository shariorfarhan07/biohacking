// Server-only fetch helper for Server Components.
// Forwards the incoming request's cookies to the backend so SSR data loads
// and session checks see the same session as the browser.
import "server-only";
import { cookies } from "next/headers";
import { ApiError } from "./api-client";

// Runs inside the frontend container itself, so it can always reach the
// backend directly over the internal Docker network — no need to round-trip
// through this app's own public port and the /api/* rewrite proxy the way
// browser-side calls (api-client.ts) do. INTERNAL_API_URL is intentionally
// not NEXT_PUBLIC_-prefixed so it's never inlined into the client bundle.
const API_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function serverFetch<T>(
  path: string,
  init: { method?: string; query?: Record<string, string | number | undefined> } = {}
): Promise<T> {
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const url = new URL(`${API_URL}/api${path}`);
  if (init.query) {
    Object.entries(init.query).forEach(([key, value]) => {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    });
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: init.method ?? "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });
  } catch (err) {
    throw new ApiError(0, "Unable to reach the server.");
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
