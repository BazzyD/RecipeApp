import { ISearchRepository } from './irepository';
import { RecipeIngredient } from '../../shared/entities/RecipeIngredient';
import { db } from '../../shared/firebase/firebaseAdmin';
import { re } from 'mathjs';
import { SubRecipe } from '../../shared/entities/SubRecipe';
import { FieldPath } from 'firebase-admin/firestore';
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

export class SearchRepository implements ISearchRepository {

    async getAll(recipeId: string): Promise<{ targetRecipe: VectorRecipe | undefined, recipes: VectorRecipe[] }> {
        const recipesRef = await db.collection('recipes').get();

        const results: VectorRecipe[] = [];

        for (const doc of recipesRef.docs) {
            const recipeId = doc.id;

            // Get direct ingredients
            const ingredientsSnapshot = await db.collection('recipe_ingredients')
                .where('recipeId', '==', recipeId)
                .get();

            let ingredientIds = ingredientsSnapshot.docs
                .map(doc => doc.data().ingredientId)
                .filter(Boolean);

            // Get subrecipes
            const subRecipesSnapshot = await db.collection('subrecipes')
                .where('recipeId', '==', recipeId)
                .get();

            for (const subDoc of subRecipesSnapshot.docs) {
                const subRecipeId = subDoc.id;

                const subIngredientsSnapshot = await db.collection('subrecipe_ingredients')
                    .where('subRecipeId', '==', subRecipeId)
                    .get();

                const subIngredientIds = subIngredientsSnapshot.docs
                    .map(doc => doc.data().ingredientId)
                    .filter(Boolean);

                ingredientIds = ingredientIds.concat(subIngredientIds);
            }

            // Remove duplicates
            const uniqueIngredientIds = Array.from(new Set(ingredientIds));

            results.push({
                id: recipeId,
                ingredients: uniqueIngredientIds,
            });
        }
        const targetRecipe = results.find(r => r.id === recipeId);
        const otherRecipes = results.filter(r => r.id !== recipeId);

        return { targetRecipe, recipes: otherRecipes };
    }

    async exists(recipeId: string): Promise<boolean> {
        const recipeDoc = await db.collection('recipes').doc(recipeId).get();
        if (!recipeDoc.exists) {
            return false; // no ingredient found
        } return true;
    }

    async getRecipesById(recipeIds: string[]): Promise<Recipe[]> {
        const chunks: string[][] = [];
        const results: Recipe[] = [];

        // Split IDs into chunks of 10 (Firestore limit)
        for (let i = 0; i < recipeIds.length; i += 10) {
            chunks.push(recipeIds.slice(i, i + 10));
        }

        for (const chunk of chunks) {
            const snapshot = await db
                .collection('recipes')
                .where(FieldPath.documentId(), 'in', chunk)
                .get();

            snapshot.forEach(doc => {
                const data = doc.data() as Recipe;
                results.push({ id: doc.id, title: data.title, url: data.url, image: data.image });
            });
        }

        return results;
    }
}


