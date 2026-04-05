export default function PlatformShowcase() {
  const platforms = [
    {
      name: '99acres',
      description: 'India\'s No.1 Property Portal',
      color: 'from-green-500 to-emerald-600',
      icon: '🏠',
      stats: '1.2M+ listings',
    },
    {
      name: 'MagicBricks',
      description: 'India\'s Leading Property Site',
      color: 'from-red-500 to-rose-600',
      icon: '🏢',
      stats: '800K+ listings',
    },
    {
      name: 'Housing.com',
      description: 'Smart Property Search',
      color: 'from-blue-500 to-violet-600',
      icon: '🏘️',
      stats: '500K+ listings',
    },
  ];

  return (
    <section className="py-20 sm:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            <span className="text-base-content">One Search.</span>{' '}
            <span className="text-gradient">All Platforms.</span>
          </h2>
          <p className="mx-auto max-w-xl text-base-content/50 text-base sm:text-lg">
            Stop jumping between tabs. Awas searches across all major Indian real estate platforms
            simultaneously.
          </p>
        </div>

        {/* Platform cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          {platforms.map((platform, i) => (
            <div
              key={platform.name}
              className="glass-card group relative rounded-2xl p-6 sm:p-8 cursor-pointer"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Gradient accent line */}
              <div
                className={`absolute top-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${platform.color} opacity-60 group-hover:opacity-100 transition-opacity`}
              />

              <div className="text-4xl mb-4">{platform.icon}</div>

              <h3 className="text-lg font-bold text-base-content mb-1">{platform.name}</h3>
              <p className="text-sm text-base-content/50 mb-4">{platform.description}</p>

              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${platform.color}`} />
                <span className="text-xs font-medium text-base-content/40">{platform.stats}</span>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-20 sm:mt-28">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              <span className="text-base-content">How</span>{' '}
              <span className="text-gradient">It Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Describe Your Dream Home',
                desc: 'Type in natural language — just like talking to a friend. "3 BHK near metro in Bangalore under 1 crore".',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.671 1.09-.085 2.17-.207 3.238-.364 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Smart Filter Parsing',
                desc: 'Our parser instantly extracts BHK, budget, location, amenities, and more into structured filters.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Unified Results',
                desc: 'View matching listings from 99acres, MagicBricks, and Housing.com — all in one beautiful interface.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center sm:text-left">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-primary/40 mb-2 tracking-widest">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-bold text-base-content mb-2">{item.title}</h3>
                <p className="text-sm text-base-content/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
