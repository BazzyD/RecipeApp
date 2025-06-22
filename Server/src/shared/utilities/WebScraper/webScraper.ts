
import { EserDakotScraper } from './EserDakotScraper';
import { Recipe } from '../../entities/Recipe';

export class WebScraper {
    async scrape(url: string) : Promise<Recipe>{
        const hostname = new URL(url).hostname;
        if (hostname === 'www.10dakot.co.il') {
            const scraper = new EserDakotScraper();
            const  recipe = await scraper.scrape(url);
            if (recipe)
                return recipe;
            throw new Error('Recipe not found');
        }
        else {
            throw new Error('Unsupported website');
        }
    }}
