import { NextRequest, NextResponse } from 'next/server';
import { MultiAiClient } from '@rajat19/aiwrap';

const client = new MultiAiClient();

const SYSTEM_PROMPT = `You are a real estate query parser. Extract property filters from the user's natural language query.
You must output strictly valid JSON matching the interface PropertyFilters.
Fields available in PropertyFilters:
- city (string)
- localities (array of strings)
- bhkConfig (array of: '1rk', '1bhk', '2bhk', '3bhk', '4bhk', '5+bhk')
- propertyType (array of: 'apartment', 'independent_house', 'villa', 'builder_floor', 'residential_land', 'farm_house')
- budget: { min?: number, max?: number }
- furnishingStatus (array of: 'furnished', 'semifurnished', 'unfurnished')
- constructionStatus (array of: 'ready_to_move', 'under_construction', 'new_launch')
- listedBy (array of: 'owner', 'builder', 'dealer', 'certified_agent')
- facing (array of: 'north', 'south', 'east', 'west', 'north_east', 'north_west', 'south_east', 'south_west')
- amenities (array of strings like 'parking', 'gym', 'pool')
- isVerified (boolean)
- isReraApproved (boolean)
- hasPhotos (boolean)

Rules:
1. Try to set the primary city if implied or explicitly stated.
2. Localities should be specific sub-regions.
3. Convert all monetary values strictly to numbers (e.g. 50 lakhs -> 5000000, 1.5 crore -> 15000000).
4. Do NOT hallucinate fields. If a filter is not mentioned, omit it.
`;

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is missing' }, { status: 400 });
    }

    const res = await client.generate({
      system: SYSTEM_PROMPT,
      prompt: query,
      strictJson: true,
      maxJsonRetries: 2,
    });

    const filters = res.json || {};
    return NextResponse.json({ filters });
  } catch (err: any) {
    console.error('[/api/parse] AI Parse Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to parse' },
      { status: 500 }
    );
  }
}
