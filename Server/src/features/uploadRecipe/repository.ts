/**
 * Repository for handling storing, retrieving, and checking recipe data.
 * Interacts with Firestore and supports batched writes for consistency.
 */

import { IRecipeRepository } from './irepository';
import { randomUUID, UUID } from 'crypto';
import { db } from '../../shared/firebase/firebaseAdmin';
import { Recipe } from '../../shared/entities';
import { getRecipeIngredientsWithNames, getInstructions, getSubRecipesWithIngredients } from '../../shared/GetRecipeInfoFunctions';

export class RecipeRepository implements IRecipeRepository {

  /**
   * Retrieves a full recipe by its URL.
   * Populates the recipe with ingredients, instructions, and sub-recipes.
   */
  async getByUrl(url: string): Promise<Recipe | null> {
    const recipeSnapshot = await db
      .collection('recipes')
      .where('url', '==', url)
      .get();

    if (recipeSnapshot.empty)
      throw new Error(`Recipe URL does not exist: ${url}`);

    const recipeDoc = recipeSnapshot.docs[0];
    const recipe = recipeDoc.data() as Omit<Recipe, 'ingredients' | 'instructions' | 'subRecipes'>;

    if (!recipeDoc.id)
      throw new Error('Internal Firestore database error');

    recipe.id = recipeDoc.id;

    const [ingredients, instructions, subRecipes] = await Promise.all([
      getRecipeIngredientsWithNames(recipe.id),
      getInstructions(recipe.id),
      getSubRecipesWithIngredients(recipe.id)
    ]);

    return {
      ...recipe,
      ingredients,
      instructions,
      subRecipes
    };
  }

  /**
   * Checks if a recipe with the given URL exists in the database.
   */
  async exists(url: string): Promise<boolean> {
    const querySnapshot = await db
      .collection('recipes')
      .where('url', '==', url)
      .get();

    return !querySnapshot.empty;
  }

  /**
   * Creates a new recipe and saves it (and its components) to Firestore.
   * Uses a batched write to ensure atomicity and consistency.
   */
  async create(recipe: Recipe): Promise<Recipe> {
    const recipeId = randomUUID();
    recipe.id = recipeId;

    const batch = db.batch();

    // Save core recipe metadata
    const recipeRef = db.collection('recipes').doc(recipeId);
    batch.set(recipeRef, {
      url: recipe.url,
      title: recipe.title,
      userId: recipe.userId,
      createdAt: new Date(),
      image: recipe.image,
    });

    // Save ingredients
    for (const ingredient of recipe.ingredients) {
      const ingredientId = await this.resolveIngredient(ingredient.name);
      ingredient.ingredientId = ingredientId;

      const ingredientRef = db.collection('recipe_ingredients').doc();
      batch.set(ingredientRef, {
        recipeId,
        ingredientId,
        amount: ingredient.amount,
        unit: ingredient.unit,
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

    // Save sub-recipes and their ingredients
    for (const subRecipe of recipe.subRecipes) {
      const subRecipeId = randomUUID();
      subRecipe.id = subRecipeId;

      const subRecipeRef = db.collection('subrecipes').doc(subRecipeId);
      batch.set(subRecipeRef, {
        id: subRecipeId,
        recipeId,
        name: subRecipe.name,
      });

      for (const ingredient of subRecipe.ingredients) {
        const ingredientId = await this.resolveIngredient(ingredient.name);
        ingredient.ingredientId = ingredientId;

        const subIngRef = db.collection('subrecipe_ingredients').doc();
        batch.set(subIngRef, {
          subRecipeId,
          ingredientId,
          amount: ingredient.amount,
          unit: ingredient.unit,
        });
      }
    }

    await batch.commit();
    return recipe;
  }

  /**
   * Checks whether an ingredient with the given name exists.
   */
  private async checkIngredient(name: string): Promise<boolean> {
    const querySnapshot = await db
      .collection('ingredients')
      .where('name', '==', name)
      .limit(1)
      .get();

    return !querySnapshot.empty;
  }

 /**
 * Retrieves the ID of an existing ingredient by name.
 * Assumes the ingredient already exists in Firestore.
 * 
 * If the ingredient does not exist, this method will throw an error.
 * Call `checkIngredient(name)` before using this method to avoid unexpected errors.
 */
  private async getIngredientId(name: string): Promise<string> {
    const querySnapshot = await db
      .collection('ingredients')
      .where('name', '==', name)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      throw new Error(`Ingredient not found: ${name}`);
    }

    const doc = querySnapshot.docs[0];
    const id = doc.get('id');

    if (!id) {
      throw new Error(`Ingredient missing ID: ${name}`);
    }

    return id;
  }

  /**
   * Adds a new ingredient to Firestore.
   */
  private async addIngredient(name: string, id: UUID): Promise<void> {
    const ref = db.collection('ingredients').doc();
    await ref.set({ id, name });
  }

  /**
   * Ensures an ingredient exists and returns its ID.
   * Creates it if missing.
   */
  private async resolveIngredient(name: string): Promise<string> {
    if (await this.checkIngredient(name)) {
      return this.getIngredientId(name);
    } else {
      const newId = randomUUID();
      await this.addIngredient(name, newId);
      return newId;
    }
  }
}
