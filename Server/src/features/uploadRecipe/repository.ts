import { IRecipeRepository } from './irepository';
import { randomUUID, UUID } from 'crypto';
import { db } from '../../shared/firebase/firebaseAdmin';
import { Recipe } from '../../shared/entities/Recipe';
import * as functions from '../../shared/utilities/HelperFunctions';


export class RecipeRepository implements IRecipeRepository {

  async getByUrl(url: string): Promise<Recipe | null> {
    const recipeSnapshot = await db.collection('recipes').where('url', '==', url).get();
    if (recipeSnapshot.empty) return null;


    const recipeDoc = recipeSnapshot.docs[0];
    const recipe = recipeDoc.data() as Omit<Recipe, 'ingredients' | 'instructions' | 'subRecipes'>;
    const recipeId = recipeDoc.id;
    recipe.id = recipeId;
    if (!recipeId) return null;
    const [
      recipeIngredients,
      instructions,
      subRecipes
    ] = await Promise.all([
      functions.getRecipeIngredientsWithNames(recipeId),
      functions.getInstructions(recipeId),
      functions.getSubRecipesWithIngredients(recipeId)
    ]);

    return {
      ...recipe,
      ingredients: recipeIngredients,
      instructions,
      subRecipes
    };
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
      createdAt: new Date(),
      image : recipe.image,
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
  const querySnapshot = await ingredientsRef.where('name', '==', name).limit(1).get();

  if (querySnapshot.empty) {
    throw new Error(`Ingredient not found: ${name}`);
  }

  const ingredientDoc = querySnapshot.docs[0];
  const ingredientId = ingredientDoc.get('id');

  if (!ingredientId) {
    throw new Error(`Ingredient missing ID: ${name}`);
  }

  return ingredientId;
}

  async addIngredient(name: string, id: UUID): Promise<void> {
    const ingredientRef = db.collection('ingredients').doc();
    await ingredientRef.set({
      id: id,
      name: name,
    });
  }
}


