import { SearchRepository } from './repository';
import { findSimilarRecipes } from './utilities/RecipeKNN';


type Recipe = {
  id: string;
  ingredients: string[];
};

export async function SearchRecipe(recipeId: string) {
  const repo = new SearchRepository();
  if (await repo.exists(recipeId)) {


    //get all recipes
    let { targetRecipe, recipes } = await repo.getAll(recipeId);
    targetRecipe = targetRecipe as Recipe;
    if (!targetRecipe || !recipes || recipes.length === 0) {
      throw new Error('Recipe does not exist');
    }
    //find the closest recipes
    const Recommendation = findSimilarRecipes(targetRecipe, recipes, 10);

    //return the closest recipes
    if (Recommendation) {
      return Recommendation;
    }
    else {
      throw new Error('KNN algorithem error');
    }

  }
  // fallback if somehow missing:
  throw new Error('Recipe exists but could not be fetched');
}
