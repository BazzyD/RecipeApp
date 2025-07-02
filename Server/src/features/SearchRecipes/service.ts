import { SearchRepository } from './repository';
import { findSimilarRecipes } from './utilities/RecipeKNN';

type VectorRecipe = {
    id: string;
    ingredients: string[];
};


type Recipe = {
    id: string;
    url: string;
    title: string;
    image: string;
};

export async function SearchRecipe(recipeId: string) {
  const repo = new SearchRepository();
  if (await repo.exists(recipeId)) {


    //get all recipes
    let { targetRecipe, recipes } = await repo.getAll(recipeId);
    targetRecipe = targetRecipe as VectorRecipe;
    if (!targetRecipe || !recipes || recipes.length === 0) {
      throw new Error('Recipe does not exist');
    }
    //find the closest recipes
    try {
      const RecommendationIds = findSimilarRecipes(targetRecipe, recipes, 10);
      const recommendations = await repo.getRecipesById(RecommendationIds);
      return recommendations;
    } catch (e) {
      throw new Error('KNN algorithem error');
    }

  }
  // fallback if somehow missing:
  throw new Error('Recipe exists but could not be fetched');
}
