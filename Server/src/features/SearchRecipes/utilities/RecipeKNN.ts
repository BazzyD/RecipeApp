import { forEach } from "mathjs";

type Recipe = {
  id: string;
  ingredients: string[];
};

function jaccardDistance(a: Set<string>, b: Set<string>): number {
  const intersectionSize = [...a].filter(x => b.has(x)).length;
  const unionSize = new Set([...a, ...b]).size;
  return 1 - intersectionSize / unionSize;
}

function findSimilarRecipes(targetRecipe: Recipe, recipes: Recipe[], k: number = 3): Recipe[] {
  const targetSet = new Set(targetRecipe.ingredients);

  const scoredRecipes = recipes
    .map(recipe => {
      const otherSet = new Set(recipe.ingredients);
      const distance = jaccardDistance(targetSet, otherSet);
      console.log(`Recipe: ${recipe.id}, Distance: ${distance}`);
      return { recipe, distance };
    })
    .filter(entry => entry.distance < 0.99) // filter out recipes that are too different
    .sort((a, b) => a.distance - b.distance) // smaller distance = more similar
    .slice(0, k)
    .map(entry => entry.recipe);

  return scoredRecipes;
}

export { findSimilarRecipes };
