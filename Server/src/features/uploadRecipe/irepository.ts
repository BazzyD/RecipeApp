import { Recipe } from '../../shared/entities/Recipe';

export interface IRecipeRepository {
  getByUrl(url: string): Promise<Recipe | null>;
  create(recipe: Recipe): Promise<Recipe>;
  exists(url: string): Promise<boolean>;
}
