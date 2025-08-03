import { db } from '../../shared/firebase/firebaseAdmin';
import { FieldPath } from 'firebase-admin/firestore';

import { ISearchRepository } from './irepository';

import {VectorRecipe, Recipe} from './entities'



/**
 * Utility function to chunk arrays into smaller groups of given size.
 * Firestore allows max 10 elements in `in` queries.
 */
const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

/**
 * Repository for fetching and preparing recipe data for similarity search.
 */
export class SearchRepository implements ISearchRepository {

    /**
   * Fetches all recipes and constructs ingredient vectors.
   * Includes direct and sub-recipe ingredients.
   */
    async getAll(recipeId: string): Promise<{ targetRecipe: VectorRecipe | undefined, recipes: VectorRecipe[] }> {
        const recipesRef = await db.collection('recipes').get();
        const results: VectorRecipe[] = [];

        for (const doc of recipesRef.docs) {
            const currentRecipeId = doc.id;

            // Fetch direct ingredients
            const ingredientsSnapshot = await db
            .collection('recipe_ingredients')
                .where('recipeId', '==', currentRecipeId)
                .get();

            let ingredientIds = ingredientsSnapshot.docs
                .map(doc => doc.data().ingredientId)
                .filter(Boolean);

            // Get subrecipes
            const subRecipesSnapshot = await db
            .collection('subrecipes')
                .where('recipeId', '==', currentRecipeId)
                .get();

            for (const subDoc of subRecipesSnapshot.docs) {
                const subRecipeId = subDoc.id;

                const subIngredientsSnapshot = await db
                .collection('subrecipe_ingredients')
                    .where('subRecipeId', '==', subRecipeId)
                    .get();

                const subIngredientIds = subIngredientsSnapshot.docs
                    .map(doc => doc.data().ingredientId)
                    .filter(Boolean);

                ingredientIds = ingredientIds.concat(subIngredientIds);
            }

            // Remove duplicate ingredient IDs
            const uniqueIngredientIds = Array.from(new Set(ingredientIds));

            results.push({
                id: currentRecipeId,
                ingredients: uniqueIngredientIds,
            });
        }
        
        const targetRecipe = results.find(r => r.id === recipeId);
        const otherRecipes = results.filter(r => r.id !== recipeId);

        return { targetRecipe, recipes: otherRecipes };
    }

/**
   * Checks if a recipe with the given ID exists in Firestore.
   */
    async exists(recipeId: string): Promise<boolean> {
        const recipeDoc = await db
        .collection('recipes')
        .doc(recipeId)
        .get();

        return recipeDoc.exists;
    }

    /**
   * Fetches recipe metadata (title, image, url) for given recipe IDs.
   * Handles batching due to Firestore's `in` query limit.
   */
    async getRecipesById(recipeIds: string[]): Promise<Recipe[]> {

        if (recipeIds.length === 0) return [];

        const results: Recipe[] = [];
        
        // Split IDs into chunks of 10 (Firestore limit)
        const chunks = chunk(recipeIds, 10);

        for (const chunk of chunks) {
            const snapshot = await db
                .collection('recipes')
                .where(FieldPath.documentId(), 'in', chunk)
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                results.push({ 
                    id: doc.id, 
                    title: data.title ?? 'Untitled', 
                    url: data.url ?? '', 
                    image: data.image ?? null
                });
            });
        }

        return results;
    }
}


