import { WebScraper } from '../../shared/utilities/WebScraper/webScraper';
import { RecipeRepository } from './repository';
import { Recipe } from '../../shared/entities/Recipe';


export async function uploadRecipe(url: string) {
  const repo = new RecipeRepository();
  if (await repo.exists(url)) {
        const existingRecipe = await repo.get(url);
        if (existingRecipe) return existingRecipe;
        // fallback if somehow missing:
        throw new Error('Recipe exists but could not be fetched');
  }
  const scraper = new WebScraper();
  const webRecipe : Recipe = await scraper.scrape(url); // extract ingredients + instructions
  const res = await repo.create(webRecipe);
  if (res) {
    console.log("Recipe saved successfully");
  }
  else {
    console.log("Recipe save failed");
  }
  return webRecipe;
}