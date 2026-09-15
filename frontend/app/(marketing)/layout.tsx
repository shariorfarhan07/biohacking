import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/lib/session-context";
import { ToastProvider } from "@/components/ui/Toast";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <Nav />
        <main>{children}</main>
        <Footer />
      </ToastProvider>
    </SessionProvider>
  );
}
