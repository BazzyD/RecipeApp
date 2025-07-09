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
        const imgSrc = $('.banner-slider__slide-img').attr('src');

        // We'll get all <p> siblings between "רכיבים" and "אופן ההכנה"
        const ingredients: RecipeIngredient[] = [];
        const SubRecipes: SubRecipe[] = [];
        const instructions: Instruction[] = [];
        let order: number = 1;

        const allChildren = recipeContent.children().toArray();

        let started = false;
        let done = false;

        for (const el of allChildren) {
            const tag = el.tagName;
            const text = $(el).text().trim().replace(/[:\s]/g, '');

            if (!started) {
                if (['רכיבים', 'מצרכים'].includes(text)) {
                    started = true;
                }
                continue;
            }

            if (started && (['אופןהכנה', 'אופןההכנה'].includes(text) || tag === 'div')) {
                break;
            }

            if (tag === 'ul') {
                $(el).find('li').each((_, li) => {
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
            } else if (tag === 'p' || tag === 'li') {
                const fullText = $(el).text().trim();
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
        }

        const instructionStartFound = allChildren.findIndex(el =>
            ['אופןהכנה', 'אופןההכנה'].includes($(el).text().trim().replace(/[:\s]/g, ''))
        );

        if (instructionStartFound !== -1) {
            for (let i = instructionStartFound + 1; i < allChildren.length; i++) {
                const el = allChildren[i];
                const tag = el.tagName;

                if (tag === 'div' && $(el).hasClass('adv')) break; // Stop at ads or unrelated blocks

                if (tag === 'ol') {
                    $(el).find('li').each((_, li) => {
                        const fullText = $(li).text().trim();
                        if (fullText !== '') {
                            instructions.push({
                                recipeId: null,
                                content: fullText,
                                order: order++
                            });
                        }
                    });
                } else if (tag === 'p' || tag === 'li') {
                    const fullText = $(el).text().trim();
                    if (fullText !== '') {
                        instructions.push({
                            recipeId: null,
                            content: fullText,
                            order: order++
                        });
                    }
                }
            }
        }



        const recipe: Recipe = {
            id: null,
            url: url,
            title: title,
            userId: null,
            ingredients: ingredients,
            subRecipes: SubRecipes,
            instructions: instructions,
            image: imgSrc,
        };
        return recipe;
    }
    parseIngredient(line: string, order: number): { recipeIngredient: RecipeIngredient, newOrder: number } {
        const parts = line.trim().split(/\s+/);
        const maybeAmount = parts[0];
        const maybeUnit = parts[1];
        const isAmount = /^(\d+([.,]\d+)?|\d+\/\d+|[\u00BC-\u00BE\u2150-\u215E]|\d+-\d+)$/.test(maybeAmount);

        if (isAmount) {
            const name = parts.slice(2).join(' ') || maybeUnit; // fallback to unit as name
            return {
                recipeIngredient: {
                    recipeId: null,
                    ingredientId: null,
                    amount: maybeAmount,
                    unit: parts.slice(2).join(' ') ? maybeUnit : null, // only keep unit if name exists
                    name,
                    order
                },
                newOrder: ++order
            };
        }

        // fallback: whole line is name
        return {
            recipeIngredient: {
                recipeId: null,
                ingredientId: null,
                amount: "1",
                unit: null,
                name: line.trim(),
                order
            },
            newOrder: ++order
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



function isHeaderTextMatch(el: any, $: cheerio.CheerioAPI, keywords: string[]): boolean {
    const text = $(el).text().replace(/[:\s]/g, '').trim();
    return keywords.some(keyword => text.includes(keyword));
}