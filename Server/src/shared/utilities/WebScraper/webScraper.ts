
import { EserDakotScraper } from './EserDakotScraper';
import { Recipe } from '../../entities/Recipe';

export class WebScraper {
    async scrape(url: string) : Promise<Recipe>{
        const hostname = new URL(url).hostname;
        if (hostname === 'www.10dakot.co.il') {
            const scraper = new EserDakotScraper();
            const  { ingredients,SubRecipes, instructions } = await scraper.scrape(url);
            const recipe: Recipe = {
                id: '',
                url: url,
                userId: null,
                ingredients: ingredients,
                subRecipes: SubRecipes,
                instructions: instructions,
            };
            return recipe;
        }
        else {
            throw new Error('Unsupported website');
        }
    }}
