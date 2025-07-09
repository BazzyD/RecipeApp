import { Recipe } from '../../shared/entities/Recipe';

export interface IGetRepository {
  getById(recipeId: string): Promise<Recipe | null>;
}