import { IRecipeRepository } from './irepository';
import { Recipe } from '../../shared/entities/Recipe';
import { randomUUID, UUID } from 'crypto';
import { db } from '../../shared/firebase/firebaseAdmin'; // Adjust path


export class RecipeRepository implements IRecipeRepository {

  async get(url: string): Promise<Recipe | null> {
    const recipeRef = db.collection('recipes');
    const querySnapshot = await recipeRef.where('url', '==', url).get();
    if (querySnapshot.empty) {
      return null;
    }
    const recipe = querySnapshot.docs[0].data();
    return recipe as Recipe;
  }
  async exists(url: string): Promise<boolean> {
    const ingredientsRef = db.collection('recipes');
    const querySnapshot = await ingredientsRef.where('url', '==', url).get();
    if (querySnapshot.empty) {
      return false; // no ingredient found
    } return true;
  }

  async create(recipe: Recipe): Promise<Recipe> {
    const recipeId = randomUUID();
    recipe.id = recipeId;

    const batch = db.batch();

    // Save the recipe
    const recipeRef = db.collection('recipes').doc(recipeId);
    batch.set(recipeRef, {
      url: recipe.url,
      title: recipe.title,
      userId: recipe.userId,
      createdAt: new Date()
    });

    // Save recipe ingredients
    for (const ingredient of recipe.ingredients) {
      if (await this.checkIngredient(ingredient.name)) {
        const ingredientId = await this.getIngredientId(ingredient.name);
        ingredient.ingredientId = ingredientId;
      }
      else {
        const ingredientId = randomUUID();
        ingredient.ingredientId = ingredientId;
        await this.addIngredient(ingredient.name, ingredientId);
      }
      const ingredientRef = db.collection('recipe_ingredients').doc();
      batch.set(ingredientRef, {
        recipeId,
        ingredientId: ingredient.ingredientId,
        amount: ingredient.amount,
        unit: ingredient.unit,
        order: ingredient.order,
      });
    }

    // Save instructions
    recipe.instructions.forEach((instruction) => {
      const instructionRef = db.collection('instructions').doc();
      batch.set(instructionRef, {
        recipeId,
        content: instruction.content,
        order: instruction.order
      });
    });

    // Save subrecipes + their ingredients
    for (const subRecipe of recipe.subRecipes) {
      const subRecipeId = randomUUID();
      subRecipe.id = subRecipeId;

      const subRecipeRef = db.collection('subrecipes').doc(subRecipeId);
      batch.set(subRecipeRef, {
        id: subRecipeId,
        recipeId: recipeId,
        name: subRecipe.name,
        order: subRecipe.order,
      });

      for (const ingredient of subRecipe.ingredients) {
        if (await this.checkIngredient(ingredient.name)) {
          const ingredientId = await this.getIngredientId(ingredient.name);
          ingredient.ingredientId = ingredientId;
        } else {
          const ingredientId = randomUUID();
          ingredient.ingredientId = ingredientId;
          await this.addIngredient(ingredient.name, ingredientId);
        }

        const subIngRef = db.collection('subrecipe_ingredients').doc();
        batch.set(subIngRef, {
          subRecipeId: subRecipeId,
          ingredientId: ingredient.ingredientId,
          amount: ingredient.amount,
          unit: ingredient.unit,
          order: ingredient.order,
        });
      }
    }


    await batch.commit();

    return recipe;
  }

  async checkIngredient(name: string): Promise<boolean> {
    const ingredientsRef = db.collection('ingredients');
    const querySnapshot = await ingredientsRef.where('name', '==', name).get();
    if (querySnapshot.empty) {
      return false; // no ingredient found
    } return true;
  }

  async getIngredientId(name: string): Promise<string> {
    const ingredientsRef = db.collection('ingredients');
    const querySnapshot = await ingredientsRef.where('name', '==', name).get();
    return querySnapshot.docs[0].id;
  }
  async addIngredient(name: string, id: UUID): Promise<void> {
    const ingredientRef = db.collection('ingredients').doc();
    await ingredientRef.set({
      id: id,
      name: name,
    });
  }
}


