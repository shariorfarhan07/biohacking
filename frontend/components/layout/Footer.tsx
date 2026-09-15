import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

const FOOTER_COLUMNS = [
  {
    title: "Coaching",
    links: [
      { href: "/programmes", label: "Programmes" },
      { href: "/pricing", label: "Pricing" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/advanced-performance-support", label: "Advanced Performance Support" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/results", label: "Results" },
      { href: "/blog", label: "Blog" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-obsidian-900/40">
      <div className="mx-auto max-w-content px-5 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <span className="font-display text-lg font-bold text-fog-100">{SITE_NAME}</span>
            <p className="mt-3 max-w-xs text-sm text-fog-400">
              Personalised online coaching for men — training, nutrition and performance systems,
              delivered through Everfit.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-fog-100">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-fog-400 transition-colors hover:text-cyan-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-fog-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p>Coaching services are not a substitute for professional medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
