import { IGetRepository } from './irepository';
import { db } from '../../shared/firebase/firebaseAdmin';
import { Recipe } from '../../shared/entities/Recipe';
import * as functions from '../../shared/utilities/HelperFunctions';
import { FieldPath } from 'firebase-admin/firestore';

export class GetRepository implements IGetRepository {

  async getById(recipeId: string): Promise<Recipe | null> {
    const recipeSnapshot = await db.collection('recipes').where(FieldPath.documentId(), '==', recipeId).get();
    if (recipeSnapshot.empty) return null;


    const recipeDoc = recipeSnapshot.docs[0];
    const recipe = recipeDoc.data() as Omit<Recipe, 'ingredients' | 'instructions' | 'subRecipes'>;
    recipe.id = recipeId;
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
}