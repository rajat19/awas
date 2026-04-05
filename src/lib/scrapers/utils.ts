/* ═══════════════════════════════════════════════════════════
 *  Scraper Utility: fetch page HTML with retry + timeout
 * ═══════════════════════════════════════════════════════════ */

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Fetch a page with sensible defaults for scraping.
 * Retries once on failure, 12-second total timeout.
 */
export async function fetchPage(url: string, retries = 1): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': randomUA(),
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
      next: { revalidate: 300 }, // cache for 5 min server-side
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }
    return await res.text();
  } catch (err) {
    if (retries > 0) {
      // Wait briefly then retry
      await new Promise((r) => setTimeout(r, 500));
      return fetchPage(url, retries - 1);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse price strings like "₹75.41 L", "₹3.10 Cr", "₹1.63 Cr"
 * Returns value in absolute number.
 */
export function parseIndianPrice(text: string): number {
  const cleaned = text.replace(/[₹,\s]/g, '');

  // 3.10 Cr → 31000000
  const crMatch = cleaned.match(/([\d.]+)\s*Cr/i);
  if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10_000_000);

  // 75.41 L or 75.41 Lac or 75.41 Lakh
  const lacMatch = cleaned.match(/([\d.]+)\s*(?:L|Lac|Lakh)/i);
  if (lacMatch) return Math.round(parseFloat(lacMatch[1]) * 100_000);

  // Try raw number (e.g., "5000000")
  const rawNum = parseFloat(cleaned);
  if (!isNaN(rawNum)) return Math.round(rawNum);

  return 0;
}

/**
 * Format a number to Indian price display.
 */
export function formatIndianPrice(price: number): string {
  if (price >= 10_000_000) {
    return `₹${(price / 10_000_000).toFixed(2)} Cr`;
  }
  if (price >= 100_000) {
    return `₹${(price / 100_000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Extract BHK config from a title string like "3 BHK Flat in..."
 */
export function extractBHK(
  text: string
): '1rk' | '1bhk' | '2bhk' | '3bhk' | '4bhk' | '5+bhk' | null {
  const match = text.match(/(\d+)\s*(?:bhk|BHK)/i);
  if (!match) {
    if (/1\s*rk/i.test(text)) return '1rk';
    return null;
  }
  const num = parseInt(match[1]);
  if (num >= 5) return '5+bhk';
  return `${num}bhk` as '1bhk' | '2bhk' | '3bhk' | '4bhk';
}

/**
 * Extract area in sqft from text like "1776 sq.ft" or "1800.0 Sq-ft"
 */
export function extractArea(text: string): number {
  const match = text.match(/([\d,]+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|Sq-ft)/i);
  if (match) return Math.round(parseFloat(match[1].replace(/,/g, '')));
  return 0;
}

/**
 * Generate a stable unique ID for deduplication.
 */
export function generateListingId(platform: string, ...parts: string[]): string {
  const raw = [platform, ...parts].join('-').toLowerCase().replace(/\s+/g, '-');
  // Simple hash for shortness
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return `${platform}-${Math.abs(hash).toString(36)}`;
}
