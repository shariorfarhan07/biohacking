interface AuthValuePanelProps {
  headline: string;
  description: string;
  points: string[];
}

// The reinforcement panel beside the login/register form — visible lg+,
// hidden on smaller viewports where the form alone owns the screen. Shows
// real product substance (what the account actually includes) rather than a
// fabricated testimonial or rating, since none exist yet.
export function AuthValuePanel({ headline, description, points }: AuthValuePanelProps) {
  return (
    <div className="relative hidden overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-obsidian-800 via-obsidian-900 to-obsidian-950 p-10 lg:flex lg:flex-col lg:justify-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accentblue-600/15 blur-[100px]"
      />
      <div className="relative">
        <h2 className="font-display text-2xl font-bold leading-tight text-fog-100">{headline}</h2>
        <p className="mt-3 max-w-sm text-sm text-fog-400">{description}</p>
        <ul className="mt-8 flex flex-col gap-4">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-fog-200">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
