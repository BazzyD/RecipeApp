

type VectorRecipe = {
  id: string;
  ingredients: string[];
};
type Recipe = {
  id: string;
  url: string;
  title: string;
  image: string;
};
export interface ISearchRepository {
  getAll(recipeId: string): Promise<{ targetRecipe: VectorRecipe | undefined, recipes: VectorRecipe[] }>;
  exists(recipeId: string): Promise<boolean>;
  getRecipesById(recipeIds: string[]): Promise<Recipe[]>;
}
