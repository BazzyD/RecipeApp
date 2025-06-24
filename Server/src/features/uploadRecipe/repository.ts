import { IRecipeRepository } from './irepository';
import { randomUUID, UUID } from 'crypto';
import { db } from '../../shared/firebase/firebaseAdmin'; // Adjust path
import { Recipe } from '../../shared/entities/Recipe';
import { SubRecipe } from '../../shared/entities/SubRecipe';
import { RecipeIngredient } from '../../shared/entities/RecipeIngredient';
import { Instruction } from '../../shared/entities/Instruction';


export class RecipeRepository implements IRecipeRepository {

  async get(url: string): Promise<Recipe | null> {
    const recipeRef = db.collection('recipes');
    const querySnapshot = await recipeRef.where('url', '==', url).get();
    if (querySnapshot.empty) {
      return null;
    }

    const recipe = querySnapshot.docs[0].data() as Recipe;
    recipe.id = querySnapshot.docs[0].id;

    const ingredientsRef = db.collection('recipe_ingredients');
    const ingredientsSnapshot = await ingredientsRef.where('recipeId', '==', recipe.id).get();
    const recipeIngredients = ingredientsSnapshot.docs.map(doc => doc.data() as RecipeIngredient);

    // 🔍 Get all unique ingredientIds
    const ingredientIds = recipeIngredients.map(i => i.ingredientId ?? "");

    const ingredientNameMap = new Map<string, string>();

    // ⚠️ If > 10, split into chunks (due to Firestore `in` limit)
    const chunked = (arr: string[], size: number) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

    for (const chunk of chunked(ingredientIds, 10)) {
      const ingredientDocs = await db.collection('ingredients')
        .where('id', 'in', chunk)
        .get();
      ingredientDocs.forEach(doc => {
        const data = doc.data();
        const id = data.id;       // your UUID string, e.g. "1883b3a7-b6f5-4ba1-85d1-f6b446c471bb"
        const name = data.name;   // ingredient name

        if (id) {
          ingredientNameMap.set(id, name);
        }
      });
    }

    // 👇 Add name to each ingredient
    recipe.ingredients = recipeIngredients.map(i => ({
      ...i,
      name: ingredientNameMap.get(i.ingredientId ? i.ingredientId : 'Unknown') ?? 'Unknown',
    }));

    const instructionsRef = db.collection('instructions');
    const instructionsSnapshot = await instructionsRef.where('recipeId', '==', recipe.id).get();
    recipe.instructions = instructionsSnapshot.docs.map(doc => doc.data() as Instruction);

    const subRecipeRef = db.collection('subrecipes');
    const subRecipesSnapshot = await subRecipeRef.where('recipeId', '==', recipe.id).get();

    recipe.subRecipes = [];

    for (const subRecipeDoc of subRecipesSnapshot.docs) {
      const subRecipeData = subRecipeDoc.data() as SubRecipe;
      const subRecipeIngredientsRef = db.collection('subrecipe_ingredients');
      const subRecipeIngredientsSnapshot = await subRecipeIngredientsRef
        .where('subRecipeId', '==', subRecipeData.id)
        .get();

      const subIngredients = subRecipeIngredientsSnapshot.docs.map(doc => doc.data() as RecipeIngredient);

      // 🧠 Resolve ingredient names for subrecipes
      const subIngredientIds = subIngredients.map(i => i.ingredientId);
      const subIngredientDocs = await db.collection('ingredients')
        .where('__name__', 'in', subIngredientIds.slice(0, 10)) // You can also chunk here if needed
        .get();
      const subMap = new Map<string, string>();
      subIngredientDocs.forEach(doc => {
        const { name } = doc.data();
        subMap.set(doc.id, name);
      });

      subRecipeData.ingredients = subIngredients.map(i => ({
        ...i,
        name: subMap.get(i.ingredientId ? i.ingredientId : 'Unknown') ?? 'Unknown',
      }));

      recipe.subRecipes.push(subRecipeData);
    }

    return recipe;
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


