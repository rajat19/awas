import React from 'react';

const THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 
  'emerald', 'corporate', 'synthwave', 'retro', 
  'cyberpunk', 'valentine', 'halloween', 'garden', 
  'forest', 'aqua', 'lofi', 'pastel', 
  'fantasy', 'wireframe', 'black', 'luxury', 
  'dracula', 'cmyk', 'autumn', 'business', 
  'acid', 'lemonade', 'night', 'coffee', 
  'winter', 'dim', 'nord', 'sunset'
];

export default function ThemePreviewPage() {
  return (
    <div className="p-10 space-y-12 bg-base-100 min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">DaisyUI Theme Preview</h1>
        <p className="opacity-70 max-w-2xl mx-auto">
          Scroll through to see how the exact same components render across all 32 built-in themes.
          Each card forces its own theme using the <code className="bg-base-200 px-1 rounded">data-theme</code> attribute.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {THEMES.map((theme) => (
          <div 
            key={theme} 
            data-theme={theme} 
            className="flex flex-col bg-base-100 text-base-content border border-base-content/20 rounded-box overflow-hidden shadow-sm"
          >
            {/* Header */}
            <div className="p-4 bg-base-200 border-b border-base-content/10 flex justify-between items-center">
              <h2 className="text-lg font-bold capitalize">{theme}</h2>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-full bg-primary" title="primary"></div>
                <div className="w-4 h-4 rounded-full bg-secondary" title="secondary"></div>
                <div className="w-4 h-4 rounded-full bg-accent" title="accent"></div>
                <div className="w-4 h-4 rounded-full bg-neutral" title="neutral"></div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              
              {/* Stats / Badges row */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="badge badge-primary">Primary</div>
                <div className="badge badge-secondary">Secondary</div>
                <div className="badge badge-accent">Accent</div>
                <div className="badge badge-ghost">Ghost</div>
              </div>

              {/* Buttons row */}
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary btn-sm">Search Properties</button>
                <button className="btn btn-secondary btn-sm">Save</button>
                <button className="btn btn-outline btn-sm">Outlined</button>
                <button className="btn btn-ghost btn-sm">Ghost</button>
              </div>

              {/* Input Group */}
              <div className="w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Your Email</span>
                </label>
                <div className="join w-full">
                  <input className="input input-bordered join-item w-full" placeholder="Email address" />
                  <button className="btn btn-primary join-item">Subscribe</button>
                </div>
              </div>

              {/* Card Example */}
              <div className="card bg-base-200 shadow-xl border border-base-content/5">
                <div className="card-body p-5">
                  <h3 className="card-title text-base">3 BHK Apartment</h3>
                  <p className="text-sm opacity-70">Gomti Nagar, Lucknow</p>
                  <div className="flex gap-2 my-2">
                    <span className="text-xs bg-base-300 rounded px-2 py-1">Ready to move</span>
                    <span className="text-xs bg-base-300 rounded px-2 py-1">1200 sqft</span>
                  </div>
                  <div className="card-actions justify-between items-center mt-2">
                    <div className="text-lg font-bold text-primary">₹ 80 L</div>
                    <button className="btn btn-primary btn-sm">View Details</button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
