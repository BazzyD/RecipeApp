import { FieldPath } from 'firebase-admin/firestore';

import { db } from '../../shared/firebase/firebaseAdmin';
import { Recipe } from '../../shared/entities';

import {getRecipeIngredientsWithNames, getInstructions, getSubRecipesWithIngredients} from '../../shared/GetRecipeInfoFunctions';

import { IGetRepository } from './irepository';

export class GetRepository implements IGetRepository {

  /**
 * Firestore implementation of IGetRepository.
 * Retrieves full recipe data including ingredients, instructions, and sub-recipes.
 */
  async getById(recipeId: string): Promise<Recipe | null> {
    
    // Fetch recipe document by ID
    const recipeSnapshot = await db
    .collection('recipes')
    .where(FieldPath.documentId(), '==', recipeId)
    .get();
    
    if (recipeSnapshot.empty) 
      throw new Error("Recipe not found");

    const recipeDoc = recipeSnapshot.docs[0];

    // Exclude parts that are fetched separately
    const recipe = recipeDoc.data() as Omit<Recipe, 'ingredients' | 'instructions' | 'subRecipes'>;
    recipe.id = recipeId;
      // Fetch all additional recipe data in parallel
    const [recipeIngredients,instructions,subRecipes] = await Promise.all([
      getRecipeIngredientsWithNames(recipeId),
      getInstructions(recipeId),
      getSubRecipesWithIngredients(recipeId)
    ]);

    // Compose final Recipe object
    return {
      ...recipe,
      ingredients: recipeIngredients,
      instructions,
      subRecipes
    };
  }
}