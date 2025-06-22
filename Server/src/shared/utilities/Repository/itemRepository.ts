import { db } from '../../firebase/firebaseAdmin'; 
import { Ingredient } from '../../entities/Ingredient'; // if using types

export async function addIngredient(ingredient: Ingredient) {
  await db.collection('ingredients').doc(ingredient.id).set({
    id: ingredient.id,
    name: ingredient.name,
  });
}