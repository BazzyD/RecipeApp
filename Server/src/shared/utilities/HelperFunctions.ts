
import { SubRecipe } from '../entities/SubRecipe';
import { RecipeIngredient } from '../entities/RecipeIngredient';
import { Instruction } from '../entities/Instruction';
import { Recipe } from '../entities/Recipe';
import { db } from '../firebase/firebaseAdmin';
export async function getRecipeIngredientsWithNames(recipeId: string): Promise<RecipeIngredient[]> {
    const snapshot = await db.collection('recipe_ingredients').where('recipeId', '==', recipeId).get();
    const ingredients = snapshot.docs.map(doc => doc.data() as Omit<RecipeIngredient, "name">);
    return await attachIngredientNames(ingredients);
  }
export  async function getSubRecipesWithIngredients(recipeId: string): Promise<Recipe['subRecipes']> {
    const snapshot = await db.collection('subrecipes').where('recipeId', '==', recipeId).get();
    const subRecipes = await Promise.all(
      snapshot.docs.map(async doc => {
        const sub = doc.data() as SubRecipe;

        const subIngredientsSnap = await db.collection('subrecipe_ingredients')
          .where('subRecipeId', '==', sub.id)
          .get();

        const ingredients = subIngredientsSnap.docs.map(d => d.data() as Omit<RecipeIngredient, "name">);
        const namedIngredients = await attachIngredientNames(ingredients);

        return {
          ...sub,
          ingredients: namedIngredients
        };
      })
    );
    return subRecipes;
  }

export  async function attachIngredientNames(ingredients: Omit<RecipeIngredient, "name">[]): Promise<RecipeIngredient[]> {
    const ingredientIds = ingredients.map(i => i.ingredientId).filter(Boolean);

    const chunk = <T>(arr: T[], size: number) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

    const nameMap = new Map<string, string>();
    for (const group of chunk(ingredientIds, 10)) {
      const snapshot = await db.collection('ingredients').where('id', 'in', group).get();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data?.id) nameMap.set(data.id, data.name);
      });
    }

    return ingredients.map(i => ({
      ...i,
      name: nameMap.get(i.ingredientId ?? 'unknown') ?? 'Unknown'
    }));
  }

export  async function getInstructions(recipeId: string): Promise<Instruction[]> {
    const snapshot = await db.collection('instructions').where('recipeId', '==', recipeId).get();
    return snapshot.docs.map(doc => doc.data() as Instruction);
  }