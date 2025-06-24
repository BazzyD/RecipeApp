import { WebScraperFactory } from '../../shared/utilities/WebScraper/webScraperFactory';
import { RecipeRepository } from './repository';
import { IWebScraper } from '../../shared/utilities/WebScraper/IWebScraper';


export async function uploadRecipe(url: string, userId: string | null ) {
  const repo = new RecipeRepository();
  if (await repo.exists(url)) {
        const existingRecipe = await repo.get(url);
        if (existingRecipe) return existingRecipe;
        // fallback if somehow missing:
        throw new Error('Recipe exists but could not be fetched');
  }
  const scraperFactory = new WebScraperFactory();
  const scraper : IWebScraper = scraperFactory.CreateScraper(url)
  const webRecipe = await scraper.scrape(url);
  webRecipe.userId = userId ?? null;
  const res = await repo.create(webRecipe);
  if (res) {
    return webRecipe;
  }
  else {
    throw new Error('Recipe could not be created');
  }
}