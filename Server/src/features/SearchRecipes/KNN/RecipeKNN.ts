// A simplified recipe structure for similarity comparison
type Recipe = {
  id: string;
  ingredients: string[];
};

/**
 * Computes the Jaccard distance between two sets.
 * Jaccard distance = 1 - (|A ∩ B| / |A ∪ B|)
 * Lower values mean more similarity (0 = identical).
 */
function jaccardDistance(a: Set<string>, b: Set<string>): number {
  const intersectionSize = [...a].filter(x => b.has(x)).length;
  const unionSize = new Set([...a, ...b]).size;
  return 1 - intersectionSize / unionSize;
}

/**
 * Finds the top K recipes most similar to the target recipe based on ingredient overlap.
 * Similarity is computed using Jaccard distance.
 *
 * @param targetRecipe - The recipe to compare others against.
 * @param recipes - All other recipes to consider.
 * @param k - The number of similar recipes to return (default = 3).
 * @returns Array of recipe IDs sorted by increasing distance (more similar first).
 */
function findSimilarRecipes(targetRecipe: Recipe, recipes: Recipe[], k: number = 3): string[] {
  const targetSet = new Set(targetRecipe.ingredients);
  const scoredRecipes = recipes
    .map(recipe => {
      const otherSet = new Set(recipe.ingredients);
      const distance = jaccardDistance(targetSet, otherSet);
      return { recipe, distance };
    })
    .filter(entry => entry.distance < 0.99) // Optional: discard nearly unrelated recipes
    .sort((a, b) => a.distance - b.distance) // Sort by similarity (ascending)
    .slice(0, k)
    .map(entry => entry.recipe.id);

  return scoredRecipes;
}

export { findSimilarRecipes };