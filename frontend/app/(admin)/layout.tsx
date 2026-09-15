import { Inter } from "next/font/google";
import { AdminSessionProvider } from "@/lib/session-context";
import { StormToastProvider } from "@/components/admin/StormToast";
import { AdminAuthGate } from "@/components/layout/AdminAuthGate";
import { ThemeProvider, THEME_INIT_SCRIPT, STORM_ROOT_ID } from "@/lib/theme-context";
import "./storm.css";

// One family carries the whole surface: the workhorse grotesque real product
// UI is set in, at the weights a console actually uses.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-storm",
  display: "swap",
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id={STORM_ROOT_ID} className={`${inter.variable} storm min-h-screen`}>
      {/* Blocking by design: must run before first paint so light/dark never flashes. */}
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      <ThemeProvider>
        <AdminSessionProvider>
          <StormToastProvider>
            <AdminAuthGate>{children}</AdminAuthGate>
          </StormToastProvider>
        </AdminSessionProvider>
      </ThemeProvider>
    </div>
  );
}
