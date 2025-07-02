import { IRecipeRepository } from './irepository';
import { randomUUID, UUID } from 'crypto';
import { db } from '../../shared/firebase/firebaseAdmin';
import { Recipe } from '../../shared/entities/Recipe';
import { SubRecipe } from '../../shared/entities/SubRecipe';
import { RecipeIngredient } from '../../shared/entities/RecipeIngredient';
import { Instruction } from '../../shared/entities/Instruction';

export class RecipeRepository implements IRecipeRepository {

  async get(url: string): Promise<Recipe | null> {
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
      this.getRecipeIngredientsWithNames(recipeId),
      this.getInstructions(recipeId),
      this.getSubRecipesWithIngredients(recipeId)
    ]);

    return {
      ...recipe,
      ingredients: recipeIngredients,
      instructions,
      subRecipes
    };
  }


  async getRecipeIngredientsWithNames(recipeId: string): Promise<RecipeIngredient[]> {
    const snapshot = await db.collection('recipe_ingredients').where('recipeId', '==', recipeId).get();
    const ingredients = snapshot.docs.map(doc => doc.data() as Omit<RecipeIngredient, "name">);
    return await this.attachIngredientNames(ingredients);
  }
  async getSubRecipesWithIngredients(recipeId: string): Promise<Recipe['subRecipes']> {
    const snapshot = await db.collection('subrecipes').where('recipeId', '==', recipeId).get();
    const subRecipes = await Promise.all(
      snapshot.docs.map(async doc => {
        const sub = doc.data() as SubRecipe;

        const subIngredientsSnap = await db.collection('subrecipe_ingredients')
          .where('subRecipeId', '==', sub.id)
          .get();

        const ingredients = subIngredientsSnap.docs.map(d => d.data() as Omit<RecipeIngredient, "name">);
        const namedIngredients = await this.attachIngredientNames(ingredients);

        return {
          ...sub,
          ingredients: namedIngredients
        };
      })
    );
    return subRecipes;
  }

  async attachIngredientNames(ingredients: Omit<RecipeIngredient, "name">[]): Promise<RecipeIngredient[]> {
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

  async getInstructions(recipeId: string): Promise<Instruction[]> {
    const snapshot = await db.collection('instructions').where('recipeId', '==', recipeId).get();
    return snapshot.docs.map(doc => doc.data() as Instruction);
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


