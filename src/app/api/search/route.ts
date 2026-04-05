/* ═══════════════════════════════════════════════════════════
 *  /api/search — Property Search API Route
 *  Accepts filters as query params, scrapes all platforms
 *  in parallel, returns aggregated results.
 * ═══════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server';
import { aggregateSearch } from '@/lib/scrapers';
import { searchParamsToFilters } from '@/lib/query-parser';

export const dynamic = 'force-dynamic'; // never cache this route

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  // Parse filters from query string
  const filters = searchParamsToFilters(sp);

  // Pagination
  const page = parseInt(sp.get('page') || '1');
  const pageSize = parseInt(sp.get('pageSize') || '24');

  try {
    const results = await aggregateSearch(filters, page, pageSize);

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('[/api/search] Aggregation failed:', err);
    return NextResponse.json(
      {
        error: 'Search failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
