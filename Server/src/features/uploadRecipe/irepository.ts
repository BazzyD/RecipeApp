import { Recipe } from '../../shared/entities';

/**
 * Interface for a repository that handles recipe persistence by URL.
 * Useful for dependency injection and testability.
 */
export interface IRecipeRepository {
  getByUrl(url: string): Promise<Recipe | null>;
  create(recipe: Recipe): Promise<Recipe>;
  exists(url: string): Promise<boolean>;
}
