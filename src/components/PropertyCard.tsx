'use client';

import type { PropertyListing } from '@/lib/types';
import {
  formatBHK,
  formatPropertyType,
  formatFurnishing,
  formatConstruction,
  formatListedBy,
  formatPlatform,
  timeAgo,
} from '@/lib/formatters';

interface PropertyCardProps {
  listing: PropertyListing;
  index: number;
  viewMode?: 'grid' | 'list';
}

export default function PropertyCard({ listing, index, viewMode = 'grid' }: PropertyCardProps) {
  const platformBadgeClass =
    listing.platform === '99acres'
      ? 'badge-99acres'
      : listing.platform === 'magicbricks'
        ? 'badge-magicbricks'
        : 'badge-housing';

  return (
    <a
      href={listing.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block group glass-card rounded-2xl overflow-hidden animate-scale-in cursor-pointer ${
        viewMode === 'list' ? 'sm:flex sm:flex-row' : ''
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
      id={`property-card-${listing.id}`}
    >
      {/* Image placeholder with gradient */}
      <div
        className={`relative bg-gradient-to-br from-base-300/60 to-base-300/30 overflow-hidden shrink-0 ${
          viewMode === 'list' ? 'h-48 sm:h-auto sm:w-72' : 'h-48 sm:h-52'
        }`}
      >
        {/* Platform badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`badge badge-sm font-semibold text-xs ${platformBadgeClass}`}>
            {formatPlatform(listing.platform)}
          </span>
        </div>

        {/* Verified & RERA badges */}
        <div className="absolute top-3 right-3 z-10 flex gap-1.5">
          {listing.isVerified && (
            <span className="badge badge-sm bg-success/90 border-0 text-white text-xs font-medium">
              <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Verified
            </span>
          )}
          {listing.isReraApproved && (
            <span className="badge badge-sm bg-info/90 border-0 text-white text-xs font-medium">
              RERA
            </span>
          )}
        </div>

        {/* Construction status */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="badge badge-sm bg-base-100/80 backdrop-blur-sm border-0 text-base-content text-xs font-medium">
            {formatConstruction(listing.constructionStatus)}
          </span>
        </div>

        {/* Gradient overlay on image area */}
        <div className="absolute inset-0 bg-gradient-to-t from-base-300/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[5]" />

        {/* Property image or fallback placeholder */}
        {listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // On error, replace with fallback
              const target = e.currentTarget;
              target.style.display = 'none';
              const sibling = target.nextElementSibling;
              if (sibling) (sibling as HTMLElement).style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="flex items-center justify-center h-full"
          style={{ display: listing.images.length > 0 ? 'none' : 'flex' }}
        >
          <svg
            className="h-16 w-16 text-base-content/10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </div>

        {/* Image count indicator */}
        {listing.images.length > 1 && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="badge badge-sm bg-base-100/80 backdrop-blur-sm border-0 text-base-content text-xs font-medium">
              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
              </svg>
              {listing.images.length}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-4 sm:p-5 flex flex-col justify-between ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div>
          {/* Price */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {listing.priceFormatted}
            </div>
            <div className="text-xs text-base-content/40 mt-0.5">
              ₹{Math.round(listing.price / listing.area).toLocaleString('en-IN')}/sq.ft
            </div>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="btn btn-ghost btn-circle btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-base-content line-clamp-1 mb-1.5">
          {listing.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-base-content/50 mb-3">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          <span className="truncate">
            {listing.location.locality}, {listing.location.city}
          </span>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 text-xs text-base-content/60 mb-3">
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            <span className="font-medium">{formatBHK(listing.bhkConfig)}</span>
          </div>
          <div className="h-3 w-px bg-base-content/10" />
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <span>{listing.area} sq.ft</span>
          </div>
          {listing.bathrooms && (
            <>
              <div className="h-3 w-px bg-base-content/10" />
              <span>{listing.bathrooms} Bath</span>
            </>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-sm badge-outline text-xs opacity-60">
            {formatPropertyType(listing.propertyType)}
          </span>
          <span className="badge badge-sm badge-outline text-xs opacity-60">
            {formatFurnishing(listing.furnishing)}
          </span>
        </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-base-content/5 mt-auto">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span className="text-xs text-base-content/40">{formatListedBy(listing.listedBy)}</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-primary/60 font-medium group-hover:text-primary transition-colors">
            View on {formatPlatform(listing.platform)}
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}
