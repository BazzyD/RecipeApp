import axios from 'axios';
import * as cheerio from 'cheerio';

import { Recipe } from '../../entities/Recipe';
import { RecipeIngredient } from '../../entities/RecipeIngredient';
import { SubRecipe } from '../../entities/SubRecipe';
import { Instruction } from '../../entities/Instruction';
import { IWebScraper } from './IWebScraper';


export class EserDakotScraper implements IWebScraper {
    async scrape(url: string): Promise<Recipe> {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const recipeContent = $('.resipes__content');
        const title = $('.banner_resipe__title').text().trim();

        // Extract ingredients — all <p> before <div class="h4">אופן ההכנה</div>
        // We'll get all <p> siblings between "רכיבים" and "אופן ההכנה"

        // Find the div with "רכיבים" text
        const ingredientsHeader = recipeContent.find('div.h4').filter((i, el) => {
            return $(el).text().trim() === 'רכיבים';
        });

        // Find the div with "אופן ההכנה" text
        const instructionsHeader = recipeContent.find('div.h4').filter((i, el) => {
            return $(el).text().trim() === 'אופן ההכנה';
        });

        // Ingredients are <p> tags between ingredientsHeader and instructionsHeader
        const ingredients: RecipeIngredient[] = [];
        const SubRecipes: SubRecipe[] = [];
        const instructions: Instruction[] = [];
        let order: number = 1;

        let current = ingredientsHeader.next();

        while (current.length && !current.is(instructionsHeader)) {
            // Check if this is a <ul> or <p>
            if (current.is('ul')) {
                // Extract all <li> inside
                current.find('li').each((i, li) => {
                    const fullText = $(li).text().trim();
                    if (fullText.includes(':')) {
                        const { subRecipe, newOrder } = this.parseSubRecipe(fullText, order);
                        if (subRecipe) {
                            SubRecipes.push(subRecipe);
                            order = newOrder;
                        }
                    } else {
                        const { recipeIngredient, newOrder } = this.parseIngredient(fullText, order);
                        if (recipeIngredient.name) {
                            ingredients.push(recipeIngredient);
                            order = newOrder;
                        }
                    }
                });
            } else if (current.is('p') || current.is('li')) {
                const fullText = current.text().trim();
                if (fullText.includes(':')) {
                    const { subRecipe, newOrder } = this.parseSubRecipe(fullText, order);
                    if (subRecipe) {
                        SubRecipes.push(subRecipe);
                        order = newOrder;
                    }
                } else {
                    const { recipeIngredient, newOrder } = this.parseIngredient(fullText, order);
                    if (recipeIngredient.name) {
                        ingredients.push(recipeIngredient);
                        order = newOrder;
                    }
                }
            }

            current = current.next();
        }
        current = instructionsHeader.next();

        // Instructions are in the <ol> after "אופן ההכנה"
        current.is('div.h4')
        while (current.length && !current.is('div.h4')) {
            // Check if this is an <ol> or <p>
            if (current.is('ol')) {
                // Extract all <li> inside
                current.find('li').each((i, li) => {
                    const fullText = $(li).text().trim();
                    if (fullText !== '') {
                        instructions.push({
                            recipeId: null,
                            content: fullText,
                            order: order++
                        });
                    }
                });
            } else if (current.is('p') || current.is('li')) {
                const fullText = current.text().trim();
                if (fullText !== '') {
                    instructions.push({
                        recipeId: null,
                        content: fullText,
                        order: order++
                    });
                }
            }

            current = current.next();
        }



        const recipe: Recipe = {
            id: null,
            url: url,
            title: title,
            userId: null,
            ingredients: ingredients,
            subRecipes: SubRecipes,
            instructions: instructions
        };
        return recipe;
    }
    parseIngredient(line: string, order: number): { recipeIngredient: RecipeIngredient, newOrder: number } {
        const parts = line.trim().split(/\s+/);

        // Case 1: amount + unit + name
        const maybeAmount = parts[0];
        const maybeUnit = parts[1];

        const isAmount = /^(\d+([.,]\d+)?|\d+\/\d+|[\u00BC-\u00BE\u2150-\u215E]|\d+-\d+)$/.test(maybeAmount);

        if (isAmount) {
            return {
                recipeIngredient: {
                    recipeId: null,
                    ingredientId: null,
                    amount: maybeAmount,
                    unit: maybeUnit,
                    name: parts.slice(2).join(' '),
                    order: order
                }, newOrder: ++order
            };
        }

        // Case 2: Just name
        return {
            recipeIngredient: {
                amount: "1",
                unit: null,
                name: line.trim(),
                recipeId: null,
                ingredientId: null,
                order: order
            }, newOrder: ++order
        };
    }






    parseSubRecipe(line: string, order: number): { subRecipe: SubRecipe, newOrder: number } {
        const subRecipeOrder = order;
        order++;
        const [groupTitle, rest] = line.split(':', 2);
        const parts = rest.split(',').map(s => s.trim());
        let ingredients: RecipeIngredient[] = [];
        for (const part of parts) {
            const { recipeIngredient, newOrder } = this.parseIngredient(part, order);
            if (recipeIngredient.name) {
                ingredients.push(recipeIngredient);
                order = newOrder;
            }
        }
        return {

            subRecipe: {
                id: null,
                recipeId: null,
                name: groupTitle,
                ingredients: ingredients,
                order: subRecipeOrder
            }, newOrder: ++order
        };
    }
    parseInstructions(): Instruction[] { return [] }

}



