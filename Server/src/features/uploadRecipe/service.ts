import { WebScraper } from '../../shared/utilities/WebScraper/webScraper';
import { RecipeRepository } from './repository';
import { Recipe } from '../../shared/entities/Recipe';


export async function uploadRecipe(url: string) {
  const repo = new RecipeRepository();
  // if(repo.checkUrl(url)){
  // const webRecipe = await repo.getRecipe(url);
  //} else{
  const scraper = new WebScraper();
  const webRecipe : Recipe = await scraper.scrape(url); // extract ingredients + instructions
  const res = await repo.create(webRecipe);
  if (res === 200) {
    console.log("Recipe saved successfully");
  }
  else {
    console.log("Recipe save failed");
  }
  return webRecipe;
}