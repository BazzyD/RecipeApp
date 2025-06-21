import { Recipe } from '../../shared/entities/Recipe';

export interface IRecipeRepository {
  get(url: string): Promise<Recipe | null>;
  create(recipe: Recipe): Promise<number>;
  exists(url: string): Promise<boolean>;
}
