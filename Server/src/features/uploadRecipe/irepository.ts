import { Recipe } from '../../shared/entities/Recipe';

export interface IRecipeRepository {
  get(url: string): Promise<Recipe | null>;
  create(recipe: Recipe): Promise<Recipe>;
  exists(url: string): Promise<boolean>;
}
