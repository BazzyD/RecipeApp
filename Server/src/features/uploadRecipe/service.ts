import { IWebScraper } from './WebScraper/IWebScraper';
import { WebScraperFactory } from './WebScraper/webScraperFactory';

import { RecipeRepository } from './repository';

/**
 * Handles uploading a recipe from a given URL.
 * - Validates input
 * - Uses the appropriate scraper to extract recipe data
 * - Saves it to the database if not already present
 */
export async function uploadRecipe(url: string, userId: string | null ) {
  const repo = new RecipeRepository();

  // Validate the URL parameter
    if (!url || typeof url !== 'string' || !url.trim()) {
       throw new Error('Missing or invalid URL' );
    }

    // Check if recipe already exists
  if (await repo.exists(url)) {
        const existingRecipe = await repo.getByUrl(url);
        if (existingRecipe) return existingRecipe;

        // Recipe exists in DB, but fetching failed — internal inconsistency
        throw new Error('Recipe exists but could not be fetched');
  }

  // Dynamically select a scraper based on URL
  const scraperFactory = new WebScraperFactory();
  const scraper : IWebScraper = scraperFactory.CreateScraper(url)

   // Scrape the recipe data
  const webRecipe = await scraper.scrape(url);
  webRecipe.userId = userId ?? null;

  // Save the scraped recipe to the database
  const created = await repo.create(webRecipe);
  if (created) {
    return webRecipe;
  } else {
    throw new Error('Recipe could not be created');
  }
}