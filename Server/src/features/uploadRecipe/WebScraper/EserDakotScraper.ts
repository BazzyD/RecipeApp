import axios from 'axios';
import * as cheerio from 'cheerio';

import { IWebScraper } from './IWebScraper';
import { RecipeIngredient, SubRecipe, Instruction, Recipe } from '../../../shared/entities';

/**
 * Scraper for the www.10dakot.co.il website.
 * Extracts recipe data including title, image, ingredients, sub-recipes, and instructions.
 */
export class EserDakotScraper implements IWebScraper {
  ingredients: RecipeIngredient[] = [];
  subRecipes: SubRecipe[] = [];
  instructions: Instruction[] = [];

  /**
   * Main scrape method that extracts and builds a complete Recipe object.
   */
  async scrape(url: string): Promise<Recipe> {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const recipeContent = $('.resipes__content');
    const title = $('.banner_resipe__title').text().trim();
    const imgSrc = $('.banner-slider__slide-img').attr('src');

    if (!title) throw new Error(`recipe title not found`);

    const allChildren = recipeContent.children().toArray();

    // === Extract Ingredients Section ===
    let started = false;
    for (const el of allChildren) {
      const tag = el.tagName;
      // Remove colons and whitespace for consistent matching of Hebrew section titles
      const text = $(el).text().trim().replace(/[:\s]/g, '');

      if (!started) {
        if (['רכיבים', 'מצרכים'].includes(text)) {
          started = true;
        }
        continue;
      }

      // End ingredient section when preparation section or unrelated div reached
      if (started && (['אופןהכנה', 'אופןההכנה'].includes(text) || tag === 'div')) {
        break;
      }

      if (tag === 'ul') {
        $(el)
          .find('li')
          .each((_, li) => {
            this.parseRecipeLine($(li).text().trim());
          });
      } else {
        this.parseRecipeLine($(el).text().trim());
      }
    }

    // === Extract Instructions Section ===
    const instructionStartFound = allChildren.findIndex((el) =>
      ['אופןהכנה', 'אופןההכנה'].includes($(el).text().trim().replace(/[:\s]/g, ''))
    );
    let order = 1;
    if (instructionStartFound !== -1) {
      for (let i = instructionStartFound + 1; i < allChildren.length; i++) {
        const el = allChildren[i];
        const tag = el.tagName;

        if (tag === 'div' && $(el).hasClass('adv')) break; // Stop at ads or unrelated blocks

        if (tag === 'ol' || tag === 'ul') {
          $(el)
            .find('li')
            .each((_, li) => {
              this.parseInstructionLine($(li).text().trim(), order);
            });
        } else {
          this.parseInstructionLine($(el).text().trim(), order);
        }
        order = this.instructions.length + 1;
      }
    }

    // Validate that ingredients and instructions were extracted successfully
    if (this.ingredients.length === 0 || this.instructions.length === 0) {
      throw new Error(`Cannot create recipe from content: ${recipeContent.html()}`);
    }

    return {
      id: null,
      url,
      title,
      userId: null,
      ingredients: this.ingredients,
      subRecipes: this.subRecipes,
      instructions: this.instructions,
      image: imgSrc,
    };
  }

  /**
   * Parses a single line of recipe content and decides whether it's a sub-recipe or a regular ingredient.
   */
  parseRecipeLine(fullText: string) {
    if (fullText.includes(':')) {
      // Sub-recipe line detected (format: "SubRecipeName: ing1, ing2, ...")
      const { subRecipe } = this.parseSubRecipe(fullText);
      this.subRecipes.push(subRecipe);
    } else {
      // Regular ingredient line
      const { recipeIngredient } = this.parseIngredient(fullText);
      this.ingredients.push(recipeIngredient);
    }
  }

  /**
   * Parses a single line of ingredient text and extracts amount, unit, and name.
   * Handles both structured (amount + unit + name) and unstructured formats.
   */
  parseIngredient(line: string): { recipeIngredient: RecipeIngredient } {
    const parts = line.trim().split(/\s+/);
    const maybeAmount = parts[0];
    const maybeUnit = parts[1];

    // Regex to detect amounts (numbers, fractions, unicode vulgar fractions, ranges)
    const isAmount = /^(\d+([.,]\d+)?|\d+\/\d+|[\u00BC-\u00BE\u2150-\u215E]|\d+-\d+)$/.test(maybeAmount);

    if (isAmount) {
      // Name might be unit if there's no separate name part
      const name = parts.slice(2).join(' ') || maybeUnit;
      return {
        recipeIngredient: {
          recipeId: null,
          ingredientId: null,
          amount: maybeAmount,
          unit: parts.slice(2).join(' ') ? maybeUnit : null,
          name,
        },
      };
    }

    // Fallback: treat entire line as ingredient name with default amount of 1
    return {
      recipeIngredient: {
        recipeId: null,
        ingredientId: null,
        amount: '1',
        unit: null,
        name: line.trim(),
      },
    };
  }

  /**
   * Parses a sub-recipe line of format "SubRecipeName: ing1, ing2, ing3"
   * Returns a SubRecipe object with parsed ingredients.
   */
  parseSubRecipe(line: string): { subRecipe: SubRecipe } {
    const [groupTitle, rest] = line.split(':', 2);

    if (!groupTitle) {
      throw new Error(`Sub-recipe title error from line: ${line}`);
    }

    const parts = rest.split(',').map((s) => s.trim());

    if (parts.length === 0) {
      throw new Error(`Sub-recipe ingredients error from line: ${line}`);
    }

    const ingredients: RecipeIngredient[] = [];

    for (const part of parts) {
      const { recipeIngredient } = this.parseIngredient(part);
      if (recipeIngredient.name) {
        ingredients.push(recipeIngredient);
      } else {
        throw new Error(`Cannot create ingredient from: ${part}`);
      }
    }

    return {
      subRecipe: {
        id: null,
        recipeId: null,
        name: groupTitle,
        ingredients,
      },
    };
  }

  /**
   * Appends a cleaned instruction to the internal list, tracking the order.
   */
  parseInstructionLine(fullText: string, order: number) {
    if (fullText !== '') {
      this.instructions.push({
        recipeId: null,
        content: fullText,
        order,
      });
    }
  }
}
