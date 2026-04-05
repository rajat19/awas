/* ═══════════════════════════════════════════════════════════
 *  Awas — Real Estate Aggregator
 *  Unified Filter Taxonomy & Type Definitions
 * ═══════════════════════════════════════════════════════════ */

// ── Enums ────────────────────────────────────────────────

export type Platform = '99acres' | 'magicbricks' | 'housing';

export type PropertyType =
  | 'apartment'
  | 'independent_house'
  | 'villa'
  | 'residential_land'
  | 'builder_floor'
  | 'farm_house';

export type BHKConfig = '1rk' | '1bhk' | '2bhk' | '3bhk' | '4bhk' | '5+bhk';

export type FurnishingStatus = 'unfurnished' | 'semifurnished' | 'furnished';

export type ConstructionStatus = 'new_launch' | 'under_construction' | 'ready_to_move';

export type ListedBy = 'owner' | 'builder' | 'dealer' | 'feature_dealer' | 'certified_agent';

export type FacingDirection =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'north_east'
  | 'north_west'
  | 'south_east'
  | 'south_west';

export type AreaUnit = 'sqft' | 'sqm' | 'sqyd';

export type PostedSince = 'yesterday' | 'last_week' | 'last_month' | 'last_3_months';

export type SaleType = 'new' | 'resale';

export type OwnershipType = 'freehold' | 'leasehold' | 'cooperative_society' | 'power_of_attorney';

export type SortBy =
  | 'relevance'
  | 'price_low_to_high'
  | 'price_high_to_low'
  | 'newest_first'
  | 'area_high_to_low'
  | 'area_low_to_high'
  | 'price_sqft_low_to_high'
  | 'price_sqft_high_to_low';

// ── Range Helper ─────────────────────────────────────────

export interface NumericRange {
  min?: number;
  max?: number;
}

// ── Unified Filter Object ────────────────────────────────

export interface PropertyFilters {
  // Location
  city?: string;
  localities?: string[];

  // Area
  builtUpArea?: NumericRange;
  carpetArea?: NumericRange;
  coveredArea?: NumericRange;
  areaUnit?: AreaUnit;

  // Financials
  budget?: NumericRange;
  hasOffers?: boolean;
  platformExclusive?: boolean;

  // Property Classification
  propertyType?: PropertyType[];
  bhkConfig?: BHKConfig[];
  bathrooms?: NumericRange;
  floorNumber?: NumericRange;
  facing?: FacingDirection[];

  // Project Specifics
  isNewProject?: boolean;
  propertyAge?: NumericRange; // in years
  societyName?: string;

  // Status & Condition
  constructionStatus?: ConstructionStatus[];
  furnishingStatus?: FurnishingStatus[];
  possessionBy?: string; // date-like string

  // Amenities
  amenities?: string[];

  // Listing Source & Verification
  listedBy?: ListedBy[];
  isVerified?: boolean;
  isReraApproved?: boolean;
  reraRegisteredAgent?: boolean;

  // Media & Engagement
  hasPhotos?: boolean;
  hasVideos?: boolean;
  hideAlreadySeen?: boolean;

  // Transaction
  saleType?: SaleType;
  ownershipType?: OwnershipType;

  // Timelines
  postedSince?: PostedSince;

  // Sorting
  sortBy?: SortBy;
  platforms?: Platform[];
}

// ── Property Listing (search result) ─────────────────────

export interface PropertyListing {
  id: string;
  platform: Platform;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  propertyType: PropertyType;
  bhkConfig: BHKConfig;
  furnishing: FurnishingStatus;
  constructionStatus: ConstructionStatus;
  area: number;
  areaUnit: AreaUnit;
  location: {
    city: string;
    locality: string;
    address: string;
  };
  listedBy: ListedBy;
  isVerified: boolean;
  isReraApproved: boolean;
  postedDate: string;
  images: string[];
  amenities: string[];
  floorNumber?: number;
  totalFloors?: number;
  facing?: FacingDirection;
  bathrooms?: number;
  balconies?: number;
  parking?: number;
  url: string;
}

// ── Query Parse Result ───────────────────────────────────

export interface ParsedQuery {
  filters: PropertyFilters;
  originalQuery: string;
  confidence: number; // 0-1 score of how well we parsed the query
  suggestions?: string[]; // suggestions for better query
}

// ── Search Results ───────────────────────────────────────

export interface SearchResults {
  listings: PropertyListing[];
  totalCount: number;
  page: number;
  pageSize: number;
  appliedFilters: PropertyFilters;
  platformBreakdown: Record<Platform, number>;
}

// ── Filter UI Metadata ───────────────────────────────────

export interface FilterOption<T = string> {
  value: T;
  label: string;
  count?: number;
}

export interface FilterGroup {
  key: keyof PropertyFilters;
  label: string;
  icon: string;
  type: 'checkbox' | 'range' | 'radio' | 'toggle';
  options?: FilterOption[];
}
