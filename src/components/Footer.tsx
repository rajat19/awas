export default function Footer() {
  return (
    <footer className="border-t border-base-content/5 bg-base-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg
                  className="h-4 w-4 text-primary-content"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </div>
              <span className="font-bold text-lg text-gradient">Awas</span>
            </div>
            <p className="text-xs text-base-content/40 leading-relaxed">
              India&apos;s smartest real estate search engine. One query, all platforms.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/30 mb-3">
              Platforms
            </h4>
            <ul className="space-y-2">
              {['99acres', 'MagicBricks', 'Housing.com'].map((p) => (
                <li key={p}>
                  <span className="text-sm text-base-content/50 hover:text-primary cursor-pointer transition-colors">
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/30 mb-3">
              Popular Cities
            </h4>
            <ul className="space-y-2">
              {['Mumbai', 'Bangalore', 'Delhi', 'Pune'].map((c) => (
                <li key={c}>
                  <span className="text-sm text-base-content/50 hover:text-primary cursor-pointer transition-colors">
                    {c}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/30 mb-3">
              Company
            </h4>
            <ul className="space-y-2">
              {['About', 'Privacy', 'Terms', 'Contact'].map((l) => (
                <li key={l}>
                  <span className="text-sm text-base-content/50 hover:text-primary cursor-pointer transition-colors">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-base-content/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-base-content/30">
            © 2026 Awas. Not affiliated with any listed platform.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-base-content/20">
              Built with Next.js, Tailwind & DaisyUI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
