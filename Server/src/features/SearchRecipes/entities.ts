/**
 * Vectorized representation of a recipe for similarity comparison.
 * Contains only the recipe ID and the list of ingredient IDs.
 */
export type VectorRecipe = {
    id: string;
    ingredients: string[];
};

/**
 * Basic metadata for a recipe used in responses or summaries.
 * Does not include ingredients, instructions, or sub-recipes.
 */
export type Recipe = {
    id: string;
    url: string;
    title: string;
    image?: string ;
};