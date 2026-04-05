'use client';

import { useState } from 'react';
import type { PropertyFilters } from '@/lib/types';

interface FilterSidebarProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

// ── Filter Section Component ─────────────────────────────

function FilterSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-base-content/5 last:border-0">
      <button
        className="flex w-full items-center justify-between py-3.5 px-1 text-sm font-semibold text-base-content/80 hover:text-base-content transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-primary/60">{icon}</span>
          {title}
        </div>
        <svg
          className={`h-4 w-4 text-base-content/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="pb-4 px-1">{children}</div>}
    </div>
  );
}

// ── Checkbox Group ───────────────────────────────────────

function CheckboxGroup<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (selected: T[]) => void;
}) {
  const toggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-1.5">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-2.5 cursor-pointer py-1 px-1 rounded-lg hover:bg-base-content/5 transition-colors"
        >
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="checkbox checkbox-xs checkbox-primary"
          />
          <span className="text-xs text-base-content/60">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

// ── Main Sidebar ─────────────────────────────────────────

export default function FilterSidebar({
  filters,
  onFiltersChange,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const updateFilter = <K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFiltersChange({
      city: filters.city,
      localities: filters.localities,
    });
  };

  const activeCount = Object.entries(filters).filter(
    ([key, val]) => key !== 'city' && key !== 'localities' && val !== undefined && val !== null && (Array.isArray(val) ? val.length > 0 : true)
  ).length;

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-base-content/5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-base-content">Filters</h2>
          {activeCount > 0 && (
            <span className="badge badge-xs badge-primary">{activeCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-xs lg:hidden">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-2">
        {/* BHK Configuration */}
        <FilterSection
          title="Configuration"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          }
        >
          <CheckboxGroup
            options={[
              { value: '1rk', label: '1 RK' },
              { value: '1bhk', label: '1 BHK' },
              { value: '2bhk', label: '2 BHK' },
              { value: '3bhk', label: '3 BHK' },
              { value: '4bhk', label: '4 BHK' },
              { value: '5+bhk', label: '5+ BHK' },
            ]}
            selected={filters.bhkConfig || []}
            onChange={(v) => updateFilter('bhkConfig', v.length > 0 ? v : undefined)}
          />
        </FilterSection>

        {/* Property Type */}
        <FilterSection
          title="Property Type"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          }
        >
          <CheckboxGroup
            options={[
              { value: 'apartment', label: 'Apartment' },
              { value: 'independent_house', label: 'Independent House' },
              { value: 'villa', label: 'Villa' },
              { value: 'builder_floor', label: 'Builder Floor' },
              { value: 'residential_land', label: 'Residential Land' },
              { value: 'farm_house', label: 'Farm House' },
            ]}
            selected={filters.propertyType || []}
            onChange={(v) => updateFilter('propertyType', v.length > 0 ? v : undefined)}
          />
        </FilterSection>

        {/* Budget */}
        <FilterSection
          title="Budget"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-base-content/40 mb-1 block">Min (₹ Lakhs)</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.budget?.min ? filters.budget.min / 100000 : ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) * 100000 : undefined;
                    updateFilter('budget', { ...filters.budget, min: val });
                  }}
                  className="input input-bordered input-sm w-full text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-base-content/40 mb-1 block">Max (₹ Lakhs)</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.budget?.max ? filters.budget.max / 100000 : ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) * 100000 : undefined;
                    updateFilter('budget', { ...filters.budget, max: val });
                  }}
                  className="input input-bordered input-sm w-full text-xs"
                />
              </div>
            </div>
            {/* Quick budget buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '< 30L', max: 3000000 },
                { label: '< 50L', max: 5000000 },
                { label: '< 80L', max: 8000000 },
                { label: '< 1Cr', max: 10000000 },
                { label: '< 2Cr', max: 20000000 },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => updateFilter('budget', { max: b.max })}
                  className={`badge badge-sm cursor-pointer transition-colors ${
                    filters.budget?.max === b.max
                      ? 'badge-primary'
                      : 'badge-outline opacity-50 hover:opacity-80'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Construction Status */}
        <FilterSection
          title="Construction Status"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.049.58.025 1.193-.14 1.743" />
            </svg>
          }
        >
          <CheckboxGroup
            options={[
              { value: 'ready_to_move', label: 'Ready to Move' },
              { value: 'under_construction', label: 'Under Construction' },
              { value: 'new_launch', label: 'New Launch' },
            ]}
            selected={filters.constructionStatus || []}
            onChange={(v) => updateFilter('constructionStatus', v.length > 0 ? v : undefined)}
          />
        </FilterSection>

        {/* Furnishing Status */}
        <FilterSection
          title="Furnishing"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
        >
          <CheckboxGroup
            options={[
              { value: 'furnished', label: 'Furnished' },
              { value: 'semifurnished', label: 'Semi-Furnished' },
              { value: 'unfurnished', label: 'Unfurnished' },
            ]}
            selected={filters.furnishingStatus || []}
            onChange={(v) => updateFilter('furnishingStatus', v.length > 0 ? v : undefined)}
          />
        </FilterSection>

        {/* Listed By */}
        <FilterSection
          title="Listed By"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
          defaultOpen={false}
        >
          <CheckboxGroup
            options={[
              { value: 'owner', label: 'Owner' },
              { value: 'builder', label: 'Builder' },
              { value: 'dealer', label: 'Dealer' },
              { value: 'certified_agent', label: 'Certified Agent' },
            ]}
            selected={filters.listedBy || []}
            onChange={(v) => updateFilter('listedBy', v.length > 0 ? v : undefined)}
          />
        </FilterSection>

        {/* Facing */}
        <FilterSection
          title="Facing Direction"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          }
          defaultOpen={false}
        >
          <CheckboxGroup
            options={[
              { value: 'north', label: 'North' },
              { value: 'south', label: 'South' },
              { value: 'east', label: 'East' },
              { value: 'west', label: 'West' },
              { value: 'north_east', label: 'North-East' },
              { value: 'north_west', label: 'North-West' },
              { value: 'south_east', label: 'South-East' },
              { value: 'south_west', label: 'South-West' },
            ]}
            selected={filters.facing || []}
            onChange={(v) => updateFilter('facing', v.length > 0 ? v : undefined)}
          />
        </FilterSection>

        {/* Verification & RERA */}
        <FilterSection
          title="Verification"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          }
          defaultOpen={false}
        >
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer py-1 px-1 rounded-lg hover:bg-base-content/5 transition-colors">
              <span className="text-xs text-base-content/60">Verified Only</span>
              <input
                type="checkbox"
                checked={!!filters.isVerified}
                onChange={(e) => updateFilter('isVerified', e.target.checked || undefined)}
                className="toggle toggle-xs toggle-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1 px-1 rounded-lg hover:bg-base-content/5 transition-colors">
              <span className="text-xs text-base-content/60">RERA Approved</span>
              <input
                type="checkbox"
                checked={!!filters.isReraApproved}
                onChange={(e) => updateFilter('isReraApproved', e.target.checked || undefined)}
                className="toggle toggle-xs toggle-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1 px-1 rounded-lg hover:bg-base-content/5 transition-colors">
              <span className="text-xs text-base-content/60">With Photos</span>
              <input
                type="checkbox"
                checked={!!filters.hasPhotos}
                onChange={(e) => updateFilter('hasPhotos', e.target.checked || undefined)}
                className="toggle toggle-xs toggle-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1 px-1 rounded-lg hover:bg-base-content/5 transition-colors">
              <span className="text-xs text-base-content/60">With Videos</span>
              <input
                type="checkbox"
                checked={!!filters.hasVideos}
                onChange={(e) => updateFilter('hasVideos', e.target.checked || undefined)}
                className="toggle toggle-xs toggle-primary"
              />
            </label>
          </div>
        </FilterSection>

        {/* Platforms */}
        <FilterSection
          title="Platforms"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <CheckboxGroup
            options={[
              { value: '99acres', label: '99acres' },
              { value: 'magicbricks', label: 'MagicBricks' },
              { value: 'housing', label: 'Housing.com' },
            ]}
            selected={filters.platforms || []}
            onChange={(v) => updateFilter('platforms', v.length > 0 ? (v as any) : undefined)}
          />
        </FilterSection>

        {/* Amenities */}
        <FilterSection
          title="Amenities"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          }
          defaultOpen={false}
        >
          <div className="flex flex-wrap gap-1.5">
            {[
              'Parking',
              'Gym',
              'Swimming Pool',
              'Lift',
              'Security',
              'Power Backup',
              'Park',
              'Clubhouse',
              'Playground',
              'Vaastu Compliant',
            ].map((amenity) => {
              const selected = filters.amenities?.includes(amenity.toLowerCase());
              return (
                <button
                  key={amenity}
                  onClick={() => {
                    const current = filters.amenities || [];
                    const lower = amenity.toLowerCase();
                    if (current.includes(lower)) {
                      updateFilter(
                        'amenities',
                        current.filter((a) => a !== lower)
                      );
                    } else {
                      updateFilter('amenities', [...current, lower]);
                    }
                  }}
                  className={`badge badge-sm cursor-pointer transition-all ${
                    selected
                      ? 'badge-primary'
                      : 'badge-outline opacity-50 hover:opacity-80'
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </FilterSection>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-base-300/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-base-100 border-r border-base-content/5 transition-transform duration-300 lg:sticky lg:top-32 lg:z-auto lg:h-auto lg:max-h-[calc(100vh-9rem)] lg:w-72 lg:shrink-0 lg:translate-x-0 lg:rounded-2xl lg:border lg:border-base-content/5 lg:overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
