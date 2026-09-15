"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PortalPageHeader } from "@/components/dashboard/PortalPageHeader";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/lib/session-context";
import { authApi, ApiError } from "@/lib/api-client";

/**
 * Settings read as rows — what the setting is on the left, its control on the
 * right — rather than a stack of form fields, so the page can be scanned for
 * the one thing you came to change.
 */
function SettingRow({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string;
  description?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 py-5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
      <div className="pt-0.5">
        <label htmlFor={htmlFor} className="text-sm font-medium text-fog-200">
          {label}
        </label>
        {description && <p className="mt-1 text-xs text-fog-500">{description}</p>}
      </div>
      {/* One control column width across every row — a name field stretched to
          the full panel reads as a text area, not a name. */}
      <div className="min-w-0 max-w-md">{children}</div>
    </div>
  );
}

function SettingsSection({
  heading,
  description,
  children,
}: {
  heading: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <GlassPanel>
      <div className="border-b border-white/8 pb-5">
        <h2 className="font-display text-lg font-semibold text-fog-100">{heading}</h2>
        <p className="mt-1 max-w-prose text-sm text-fog-400">{description}</p>
      </div>
      {children}
    </GlassPanel>
  );
}

export default function DashboardSettingsPage() {
  const { customer, refresh } = useSession();
  const { showToast } = useToast();
  const ids = useId();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileErrors, setProfileErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (customer) {
      setFirstName(customer.first_name);
      setLastName(customer.last_name);
    }
  }, [customer]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: { firstName?: string; lastName?: string } = {};
    if (!firstName.trim()) next.firstName = "Required.";
    if (!lastName.trim()) next.lastName = "Required.";
    setProfileErrors(next);
    if (Object.keys(next).length > 0) return;

    setSavingProfile(true);
    try {
      await authApi.updateMe({ first_name: firstName, last_name: lastName });
      await refresh();
      showToast("Profile updated.", "success");
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "We couldn't update your profile right now.",
        "error"
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!currentPassword) next.currentPassword = "Required.";
    if (!newPassword || newPassword.length < 8) next.newPassword = "At least 8 characters.";
    if (confirmPassword !== newPassword) next.confirmPassword = "Passwords do not match.";
    setPasswordErrors(next);
    if (Object.keys(next).length > 0) return;

    setSavingPassword(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      showToast("Password updated.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "We couldn't update your password right now.",
        "error"
      );
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PortalPageHeader
        title="Settings"
        description="Your account details and the password you sign in with."
      />

      <SettingsSection
        heading="Profile"
        description="How your name appears on your account and to your coach."
      >
        <form onSubmit={handleProfileSubmit} noValidate>
          <div className="divide-y divide-white/8">
            <SettingRow label="First name" htmlFor={`${ids}-first`}>
              <Input
                id={`${ids}-first`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={profileErrors.firstName}
              />
            </SettingRow>
            <SettingRow label="Last name" htmlFor={`${ids}-last`}>
              <Input
                id={`${ids}-last`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={profileErrors.lastName}
              />
            </SettingRow>
            <SettingRow
              label="Email"
              description="Used to sign in and to reach you about your coaching."
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-sm text-fog-100">{customer?.email ?? "—"}</span>
                <Link
                  href="/dashboard/support/new"
                  className="text-sm text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Request a change
                </Link>
              </div>
            </SettingRow>
          </div>
          <div className="mt-6 border-t border-white/8 pt-5">
            <Button type="submit" loading={savingProfile}>
              Save changes
            </Button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection
        heading="Password"
        description="Choose a strong password you don't use anywhere else."
      >
        <form onSubmit={handlePasswordSubmit} noValidate>
          <div className="divide-y divide-white/8">
            <SettingRow label="Current password" htmlFor={`${ids}-current`}>
              <Input
                id={`${ids}-current`}
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={passwordErrors.currentPassword}
              />
            </SettingRow>
            <SettingRow
              label="New password"
              description="At least 8 characters."
              htmlFor={`${ids}-new`}
            >
              <Input
                id={`${ids}-new`}
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={passwordErrors.newPassword}
              />
            </SettingRow>
            <SettingRow label="Confirm new password" htmlFor={`${ids}-confirm`}>
              <Input
                id={`${ids}-confirm`}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={passwordErrors.confirmPassword}
              />
            </SettingRow>
          </div>
          <div className="mt-6 border-t border-white/8 pt-5">
            <Button type="submit" loading={savingPassword}>
              Update password
            </Button>
          </div>
        </form>
      </SettingsSection>
    </div>
  );
}
