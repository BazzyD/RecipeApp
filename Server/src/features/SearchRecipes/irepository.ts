type Recipe = {
  id: string;
  ingredients: string[];
};

export interface ISearchRepository {
  getAll(recipeId: string): Promise<{ targetRecipe: Recipe | undefined, recipes: Recipe[] }>;
  exists(recipeId: string): Promise<boolean>;
}
