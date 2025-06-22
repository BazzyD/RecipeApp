import { addIngredient } from '../shared/utilities/Repository/itemRepository';
import { db } from '../shared/firebase/firebaseAdmin';

describe('addIngredient integration test', () => {
  const testIngredient = { id: 'test-ingredient-1', name: 'בדיקה' };


  it('adds an ingredient to Firestore', async () => {
    await addIngredient(testIngredient);

    const doc = await db.collection('ingredients').doc(testIngredient.id).get();
console.log('FIRESTORE_EMULATOR_HOST:', process.env.FIRESTORE_EMULATOR_HOST);


    
    expect(doc.exists).toBe(true);

    const data = doc.data();
    expect(data).toBeDefined();
    expect(data?.id).toBe(testIngredient.id);
    expect(data?.name).toBe(testIngredient.name);
  },20000 );
});
