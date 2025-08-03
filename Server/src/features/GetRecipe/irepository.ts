import { Recipe } from '../../shared/entities';
/**
 * Interface for a repository that retrieves a recipe by ID.
 * Useful for dependency injection and testability.
 */
export interface IGetRepository {
  getById(recipeId: string): Promise<Recipe | null>;
}