import { IRecipeRepository } from './irepository';
import { Recipe } from '../../shared/entities/Recipe';
export class RecipeRepository implements IRecipeRepository {
  get(url: string): Promise<Recipe | null> {
    throw new Error('Method not implemented.');
  }
  exists(url: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async create(recipe: Recipe): Promise<number> {
    // For now, just log it.
    throw new Error('Method not implemented.');
  }
}
