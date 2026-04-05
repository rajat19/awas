/* ═══════════════════════════════════════════════════════════
 *  Awas — Natural Language Query Parser
 *  Parses organic real estate queries into structured filters
 * ═══════════════════════════════════════════════════════════ */

import type {
  PropertyFilters,
  ParsedQuery,
  BHKConfig,
  PropertyType,
  FurnishingStatus,
  ConstructionStatus,
  ListedBy,
  FacingDirection,
  SortBy,
  Platform,
} from './types';

// ── Keyword Maps ─────────────────────────────────────────

const BHK_PATTERNS: Record<string, BHKConfig> = {
  '1 rk': '1rk',
  '1rk': '1rk',
  '1 bhk': '1bhk',
  '1bhk': '1bhk',
  '2 bhk': '2bhk',
  '2bhk': '2bhk',
  '3 bhk': '3bhk',
  '3bhk': '3bhk',
  '4 bhk': '4bhk',
  '4bhk': '4bhk',
  '5 bhk': '5+bhk',
  '5bhk': '5+bhk',
  '5+ bhk': '5+bhk',
  '6 bhk': '5+bhk',
};

const PROPERTY_TYPE_PATTERNS: Record<string, PropertyType> = {
  apartment: 'apartment',
  flat: 'apartment',
  flats: 'apartment',
  apartments: 'apartment',
  independent: 'independent_house',
  'independent house': 'independent_house',
  'independent home': 'independent_house',
  house: 'independent_house',
  villa: 'villa',
  villas: 'villa',
  bungalow: 'villa',
  plot: 'residential_land',
  land: 'residential_land',
  'residential land': 'residential_land',
  'residential plot': 'residential_land',
  'builder floor': 'builder_floor',
  'builder floors': 'builder_floor',
  'farm house': 'farm_house',
  farmhouse: 'farm_house',
};

const FURNISHING_PATTERNS: Record<string, FurnishingStatus> = {
  furnished: 'furnished',
  'fully furnished': 'furnished',
  'semi furnished': 'semifurnished',
  'semi-furnished': 'semifurnished',
  semifurnished: 'semifurnished',
  unfurnished: 'unfurnished',
};

const CONSTRUCTION_PATTERNS: Record<string, ConstructionStatus> = {
  'ready to move': 'ready_to_move',
  'ready to move in': 'ready_to_move',
  'ready possession': 'ready_to_move',
  'under construction': 'under_construction',
  'new launch': 'new_launch',
  'newly launched': 'new_launch',
  'pre launch': 'new_launch',
};

const LISTED_BY_PATTERNS: Record<string, ListedBy> = {
  owner: 'owner',
  'by owner': 'owner',
  'owner direct': 'owner',
  'no broker': 'owner',
  'no brokerage': 'owner',
  builder: 'builder',
  'by builder': 'builder',
  dealer: 'dealer',
  broker: 'dealer',
  agent: 'certified_agent',
};

const FACING_PATTERNS: Record<string, FacingDirection> = {
  'north facing': 'north',
  'south facing': 'south',
  'east facing': 'east',
  'west facing': 'west',
  'north east': 'north_east',
  'north west': 'north_west',
  'south east': 'south_east',
  'south west': 'south_west',
};

const AMENITY_KEYWORDS = [
  'parking',
  'park',
  'garden',
  'swimming pool',
  'pool',
  'gym',
  'gymnasium',
  'lift',
  'elevator',
  'power backup',
  'security',
  'gated',
  'club house',
  'clubhouse',
  'playground',
  'jogging track',
  'vaastu',
  'vastu',
  'vaastu compliant',
  'modular kitchen',
  'balcony',
  'terrace',
  'rooftop',
  'water supply',
  '24x7 water',
  'gas pipeline',
  'intercom',
  'servant room',
  'study room',
  'pooja room',
];

// ── Major Indian Cities ──────────────────────────────────

const CITIES = [
  'mumbai',
  'delhi',
  'bangalore',
  'bengaluru',
  'hyderabad',
  'ahmedabad',
  'chennai',
  'kolkata',
  'pune',
  'jaipur',
  'lucknow',
  'kanpur',
  'nagpur',
  'indore',
  'thane',
  'bhopal',
  'visakhapatnam',
  'vadodara',
  'ghaziabad',
  'ludhiana',
  'agra',
  'nashik',
  'faridabad',
  'noida',
  'greater noida',
  'gurgaon',
  'gurugram',
  'chandigarh',
  'coimbatore',
  'kochi',
  'patna',
  'rajkot',
  'surat',
  'varanasi',
  'dehradun',
  'mysore',
  'mysuru',
  'navi mumbai',
];

// ── Lucknow specific localities (for demo) ───────────────

const LUCKNOW_LOCALITIES = [
  'gomti nagar',
  'gomti nagar extension',
  'aliganj',
  'indira nagar',
  'hazratganj',
  'mahanagar',
  'alambagh',
  'chinhat',
  'jankipuram',
  'vikas nagar',
  'rajajipuram',
  'vrindavan yojna',
  'vrindavan yojana',
  'shaheed path',
  'sushant golf city',
  'bbd university',
  'kursi road',
  'sitapur road',
  'faizabad road',
  'raebareli road',
  'kanpur road',
  'amar shaheed path',
  'eldeco',
  'omaxe',
  'awadh vihar yojna',
];

// ── Price Parsing ────────────────────────────────────────

function parsePrice(text: string): number | undefined {
  const normalized = text.toLowerCase().replace(/,/g, '');

  // Match patterns like "80 lakhs", "1.5 crore", "50L", "2Cr"
  const patterns = [
    { regex: /(\d+(?:\.\d+)?)\s*(?:crore|cr|crores)/i, multiplier: 10000000 },
    { regex: /(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)/i, multiplier: 100000 },
    { regex: /(\d+(?:\.\d+)?)\s*(?:thousand|k)/i, multiplier: 1000 },
  ];

  for (const { regex, multiplier } of patterns) {
    const match = normalized.match(regex);
    if (match) {
      return parseFloat(match[1]) * multiplier;
    }
  }

  // Bare number
  const bareNum = normalized.match(/(\d+(?:\.\d+)?)/);
  if (bareNum) {
    const val = parseFloat(bareNum[1]);
    // Heuristic: if value is small, assume lakhs
    if (val < 500) return val * 100000;
    return val;
  }

  return undefined;
}

// ── Budget Range Extraction ──────────────────────────────

function extractBudget(query: string): { min?: number; max?: number } | null {
  const lower = query.toLowerCase();
  const result: { min?: number; max?: number } = {};

  // "under X", "below X", "less than X", "upto X"
  const underMatch = lower.match(
    /(?:under|below|less than|upto|up to|within|max|maximum|budget)\s+([\d.]+\s*(?:crore|cr|lakh|lakhs|lac|l|k|thousand)?s?)/i
  );
  if (underMatch) {
    result.max = parsePrice(underMatch[1]);
  }

  // "above X", "more than X", "min X", "starting from X"
  const aboveMatch = lower.match(
    /(?:above|more than|over|min|minimum|starting|from|atleast|at least)\s+([\d.]+\s*(?:crore|cr|lakh|lakhs|lac|l|k|thousand)?s?)/i
  );
  if (aboveMatch) {
    result.min = parsePrice(aboveMatch[1]);
  }

  // "X to Y", "X - Y" range
  const rangeMatch = lower.match(
    /([\d.]+\s*(?:crore|cr|lakh|lakhs|lac|l|k|thousand)?s?)\s*(?:to|-)\s*([\d.]+\s*(?:crore|cr|lakh|lakhs|lac|l|k|thousand)?s?)/i
  );
  if (rangeMatch) {
    result.min = parsePrice(rangeMatch[1]);
    result.max = parsePrice(rangeMatch[2]);
  }

  return result.min || result.max ? result : null;
}

// ── Main Parser ──────────────────────────────────────────

export function parseQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase().trim();
  const filters: PropertyFilters = {};
  let confidence = 0;
  let matchCount = 0;
  const totalPossible = 8; // max categories we can tag

  // 1. BHK Config
  for (const [pattern, value] of Object.entries(BHK_PATTERNS)) {
    if (lower.includes(pattern)) {
      if (!filters.bhkConfig) filters.bhkConfig = [];
      if (!filters.bhkConfig.includes(value)) {
        filters.bhkConfig.push(value);
        matchCount++;
      }
    }
  }

  // 2. Property Type
  for (const [pattern, value] of Object.entries(PROPERTY_TYPE_PATTERNS)) {
    if (lower.includes(pattern)) {
      if (!filters.propertyType) filters.propertyType = [];
      if (!filters.propertyType.includes(value)) {
        filters.propertyType.push(value);
        matchCount++;
      }
    }
  }

  // 3. Furnishing
  for (const [pattern, value] of Object.entries(FURNISHING_PATTERNS)) {
    if (lower.includes(pattern)) {
      if (!filters.furnishingStatus) filters.furnishingStatus = [];
      if (!filters.furnishingStatus.includes(value)) {
        filters.furnishingStatus.push(value);
        matchCount++;
      }
    }
  }

  // 4. Construction Status
  for (const [pattern, value] of Object.entries(CONSTRUCTION_PATTERNS)) {
    if (lower.includes(pattern)) {
      if (!filters.constructionStatus) filters.constructionStatus = [];
      if (!filters.constructionStatus.includes(value)) {
        filters.constructionStatus.push(value);
        matchCount++;
      }
    }
  }

  // 5. Listed By
  for (const [pattern, value] of Object.entries(LISTED_BY_PATTERNS)) {
    if (lower.includes(pattern)) {
      if (!filters.listedBy) filters.listedBy = [];
      if (!filters.listedBy.includes(value)) {
        filters.listedBy.push(value);
        matchCount++;
      }
    }
  }

  // 6. Facing
  for (const [pattern, value] of Object.entries(FACING_PATTERNS)) {
    if (lower.includes(pattern)) {
      if (!filters.facing) filters.facing = [];
      if (!filters.facing.includes(value)) {
        filters.facing.push(value);
      }
    }
  }

  // 7. Amenities
  for (const amenity of AMENITY_KEYWORDS) {
    if (lower.includes(amenity)) {
      if (!filters.amenities) filters.amenities = [];
      filters.amenities.push(amenity);
    }
  }

  // 8. Budget
  const budget = extractBudget(lower);
  if (budget) {
    filters.budget = budget;
    matchCount++;
  }

  // 9. City
  for (const city of CITIES) {
    if (lower.includes(city)) {
      // Normalize some city names
      if (city === 'bengaluru') filters.city = 'Bangalore';
      else if (city === 'gurugram') filters.city = 'Gurgaon';
      else if (city === 'mysuru') filters.city = 'Mysore';
      else filters.city = city.charAt(0).toUpperCase() + city.slice(1);
      matchCount++;
      break;
    }
  }

  // 10. Localities (Lucknow specific for demo)
  for (const locality of LUCKNOW_LOCALITIES) {
    if (lower.includes(locality)) {
      if (!filters.localities) filters.localities = [];
      const formatted = locality
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      filters.localities.push(formatted);

      // If we found a Lucknow locality, set city too
      if (!filters.city) {
        filters.city = 'Lucknow';
        matchCount++;
      }
    }
  }

  // 11. Boolean flags
  if (lower.includes('verified')) {
    filters.isVerified = true;
  }
  if (lower.includes('rera')) {
    filters.isReraApproved = true;
  }
  if (lower.includes('with photos') || lower.includes('with images')) {
    filters.hasPhotos = true;
  }
  if (lower.includes('with video')) {
    filters.hasVideos = true;
  }

  // Calculate confidence
  confidence = Math.min(matchCount / totalPossible, 1);

  // Generate suggestions
  const suggestions: string[] = [];
  if (!filters.city && !filters.localities?.length) {
    suggestions.push('Try adding a city or locality for better results');
  }
  if (!filters.budget) {
    suggestions.push('Add a budget range to narrow down listings');
  }
  if (!filters.bhkConfig?.length) {
    suggestions.push('Specify BHK configuration (e.g., 2 BHK, 3 BHK)');
  }

  return {
    filters,
    originalQuery: query,
    confidence,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

// ── Filter → URL Params ─────────────────────────────────

export function filtersToSearchParams(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.city) params.set('city', filters.city);
  if (filters.localities?.length) params.set('localities', filters.localities.join(','));
  if (filters.bhkConfig?.length) params.set('bhk', filters.bhkConfig.join(','));
  if (filters.propertyType?.length) params.set('type', filters.propertyType.join(','));
  if (filters.furnishingStatus?.length) params.set('furnishing', filters.furnishingStatus.join(','));
  if (filters.constructionStatus?.length)
    params.set('construction', filters.constructionStatus.join(','));
  if (filters.listedBy?.length) params.set('listedBy', filters.listedBy.join(','));
  if (filters.budget?.min) params.set('minPrice', String(filters.budget.min));
  if (filters.budget?.max) params.set('maxPrice', String(filters.budget.max));
  if (filters.facing?.length) params.set('facing', filters.facing.join(','));
  if (filters.amenities?.length) params.set('amenities', filters.amenities.join(','));
  if (filters.isVerified) params.set('verified', 'true');
  if (filters.isReraApproved) params.set('rera', 'true');
  if (filters.hasPhotos) params.set('photos', 'true');
  if (filters.hasVideos) params.set('videos', 'true');
  if (filters.sortBy) params.set('sort', filters.sortBy);
  if (filters.platforms?.length) params.set('platforms', filters.platforms.join(','));

  return params;
}

// ── URL Params → Filters ─────────────────────────────────

export function searchParamsToFilters(params: URLSearchParams): PropertyFilters {
  const filters: PropertyFilters = {};

  const city = params.get('city');
  if (city) filters.city = city;

  const localities = params.get('localities');
  if (localities) filters.localities = localities.split(',');

  const bhk = params.get('bhk');
  if (bhk) filters.bhkConfig = bhk.split(',') as BHKConfig[];

  const type = params.get('type');
  if (type) filters.propertyType = type.split(',') as PropertyType[];

  const furnishing = params.get('furnishing');
  if (furnishing) filters.furnishingStatus = furnishing.split(',') as FurnishingStatus[];

  const construction = params.get('construction');
  if (construction) filters.constructionStatus = construction.split(',') as ConstructionStatus[];

  const listedBy = params.get('listedBy');
  if (listedBy) filters.listedBy = listedBy.split(',') as ListedBy[];

  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');
  if (minPrice || maxPrice) {
    filters.budget = {};
    if (minPrice) filters.budget.min = Number(minPrice);
    if (maxPrice) filters.budget.max = Number(maxPrice);
  }

  const facing = params.get('facing');
  if (facing) filters.facing = facing.split(',') as FacingDirection[];

  const amenities = params.get('amenities');
  if (amenities) filters.amenities = amenities.split(',');

  if (params.get('verified') === 'true') filters.isVerified = true;
  if (params.get('rera') === 'true') filters.isReraApproved = true;
  if (params.get('photos') === 'true') filters.hasPhotos = true;
  if (params.get('videos') === 'true') filters.hasVideos = true;

  const sort = params.get('sort');
  if (sort) filters.sortBy = sort as SortBy;

  const platforms = params.get('platforms');
  if (platforms) filters.platforms = platforms.split(',') as Platform[];

  return filters;
}
