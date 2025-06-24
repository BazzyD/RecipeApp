import { Instruction} from "../../entities/Instruction";
import { Recipe } from "../../entities/Recipe";
import { RecipeIngredient } from "../../entities/RecipeIngredient";
import { SubRecipe } from "../../entities/SubRecipe";

export interface IWebScraper{
    scrape(url: string) : Promise<Recipe>;
    parseIngredient(line: string, order: number): {recipeIngredient : RecipeIngredient, newOrder: number };
    parseSubRecipe(line: string, order : number): {subRecipe : SubRecipe, newOrder : number};
    parseInstructions(): Instruction[];
}