import { GetRepository } from './repository';



export async function GetRecipe(recipeId: string) {
  const repo = new GetRepository();
  if (!recipeId) {
    throw new Error('Recipe indentifiction Error');
  }
    let recipe = await repo.getById(recipeId);
    if (!recipe ) {
      throw new Error('Recipe does not exist');
    }
    return recipe;
  



}
