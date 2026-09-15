"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminAuthApi, ApiError, authApi } from "./api-client";
import type { AdminUser, Customer } from "./types";

interface SessionContextValue {
  customer: Customer | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setCustomer: (customer: Customer | null) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const me = await authApi.me();
      setCustomer(me);
    } catch (err) {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ customer, loading, refresh, setCustomer }),
    [customer, loading, refresh]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}

interface AdminSessionContextValue {
  admin: AdminUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setAdmin: (admin: AdminUser | null) => void;
}

const AdminSessionContext = createContext<AdminSessionContextValue | undefined>(undefined);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const me = await adminAuthApi.me();
      setAdmin(me);
    } catch (err) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ admin, loading, refresh, setAdmin }), [admin, loading, refresh]);

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession(): AdminSessionContextValue {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminSession must be used within an AdminSessionProvider");
  return ctx;
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
