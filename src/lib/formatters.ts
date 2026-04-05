/* ═══════════════════════════════════════════════════════════
 *  Awas — Formatting Utilities
 * ═══════════════════════════════════════════════════════════ */

import type {
  BHKConfig,
  ConstructionStatus,
  FurnishingStatus,
  ListedBy,
  PropertyType,
  FacingDirection,
  Platform,
} from './types';

export function formatBHK(bhk: BHKConfig): string {
  const map: Record<BHKConfig, string> = {
    '1rk': '1 RK',
    '1bhk': '1 BHK',
    '2bhk': '2 BHK',
    '3bhk': '3 BHK',
    '4bhk': '4 BHK',
    '5+bhk': '5+ BHK',
  };
  return map[bhk] || bhk;
}

export function formatPropertyType(type: PropertyType): string {
  const map: Record<PropertyType, string> = {
    apartment: 'Apartment',
    independent_house: 'Independent House',
    villa: 'Villa',
    residential_land: 'Residential Land',
    builder_floor: 'Builder Floor',
    farm_house: 'Farm House',
  };
  return map[type] || type;
}

export function formatFurnishing(status: FurnishingStatus): string {
  const map: Record<FurnishingStatus, string> = {
    unfurnished: 'Unfurnished',
    semifurnished: 'Semi-Furnished',
    furnished: 'Furnished',
  };
  return map[status] || status;
}

export function formatConstruction(status: ConstructionStatus): string {
  const map: Record<ConstructionStatus, string> = {
    new_launch: 'New Launch',
    under_construction: 'Under Construction',
    ready_to_move: 'Ready to Move',
  };
  return map[status] || status;
}

export function formatListedBy(by: ListedBy): string {
  const map: Record<ListedBy, string> = {
    owner: 'Owner',
    builder: 'Builder',
    dealer: 'Dealer',
    feature_dealer: 'Featured Dealer',
    certified_agent: 'Certified Agent',
  };
  return map[by] || by;
}

export function formatFacing(dir: FacingDirection): string {
  const map: Record<FacingDirection, string> = {
    north: 'North',
    south: 'South',
    east: 'East',
    west: 'West',
    north_east: 'North-East',
    north_west: 'North-West',
    south_east: 'South-East',
    south_west: 'South-West',
  };
  return map[dir] || dir;
}

export function formatPlatform(platform: Platform): string {
  const map: Record<Platform, string> = {
    '99acres': '99acres',
    magicbricks: 'MagicBricks',
    housing: 'Housing.com',
  };
  return map[platform] || platform;
}

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
