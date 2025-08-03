import { GetRepository } from './repository';

/**
 * Service to retrieve a recipe by its ID using the repository layer.
 * Throws an error if the ID is invalid or the recipe is not found.
 */
export async function GetRecipe(recipeId: string) {

  // Validate input early
  if (!recipeId) {
    throw new Error('Recipe identification error');
  }

  // Attempt to fetch recipe from database
  const repo = new GetRepository();
  const recipe = await repo.getById(recipeId);
  
  if (!recipe ) {
    throw new Error('Recipe does not exist');
  }

  return recipe;
}
