import {VectorRecipe, Recipe} from './entities'
/**
 * Interface for a repository that supports vector-based recipe similarity search.
 * Useful for dependency injection and testability.
 */
export interface ISearchRepository {
  getAll(recipeId: string): Promise<{ targetRecipe: VectorRecipe | undefined, recipes: VectorRecipe[] }>;
  exists(recipeId: string): Promise<boolean>;
  getRecipesById(recipeIds: string[]): Promise<Recipe[]>;
}
