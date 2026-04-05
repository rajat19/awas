import { fetchPage } from './src/lib/scrapers/utils.ts';
import { housingScraper } from './src/lib/scrapers/housing.ts';

async function main() {
  const result = await housingScraper.scrape({ city: 'Lucknow', bhkConfig: ['3bhk'] });
  console.log(result.error);
  console.log(result.listings.length);
}
main();
