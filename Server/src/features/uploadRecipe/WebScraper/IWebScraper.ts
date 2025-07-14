import { Instruction } from "../../../shared/entities/Instruction";
import { Recipe } from "../../../shared/entities/Recipe";
import { RecipeIngredient } from "../../../shared/entities/RecipeIngredient";
import { SubRecipe } from "../../../shared/entities/SubRecipe";

export interface IWebScraper{
    scrape(url: string) : Promise<Recipe>;
    parseIngredient(line: string, order: number): {recipeIngredient : RecipeIngredient, newOrder: number };
    parseSubRecipe(line: string, order : number): {subRecipe : SubRecipe, newOrder : number};
    parseInstructions(): Instruction[];
}