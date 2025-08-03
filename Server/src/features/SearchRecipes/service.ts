import { SearchRepository } from './repository';
import { findSimilarRecipes } from './KNN/RecipeKNN';

/**
 * Service to find similar recipes using KNN.
 * - Validates the given recipeId
 * - Retrieves all recipes excluding the target
 * - Uses KNN to compute the top-K similar recipes
 * - Returns the recommended recipes
 */

export async function SearchRecipe(recipeId: string) {

  // Validate input early
  if (!recipeId) {
    throw new Error('Recipe identification error');
  }

  const repo = new SearchRepository();

  // Ensure target recipe exists
  if (await repo.exists(recipeId)) {

    // Get target recipe and candidates
    const { targetRecipe, recipes } = await repo.getAll(recipeId);

    if (!targetRecipe) {
      throw new Error('Recipe does not exist');
    }

    if (!recipes || recipes.length === 0) {
      throw new Error('error fetching recipes for comperission');
    }

    try {
      // Find most similar recipe IDs
      const recommendationIds = findSimilarRecipes(targetRecipe, recipes, 10);

      // Fetch full recipe data for recommendations
      const recommendations = await repo.getRecipesById(recommendationIds);
      return recommendations;

    } catch (err: any) {
      throw new Error(err.message || 'KNN algorithm error');
    }

  }
  // Fallback if recipe not found
  throw new Error('Recipe could not be fetched');
}
