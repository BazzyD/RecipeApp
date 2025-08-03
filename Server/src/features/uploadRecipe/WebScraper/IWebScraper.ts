import { Recipe } from '../../../shared/entities';

/**
 * Interface for web scrapers that extract recipe data from a given URL.
 * Useful for supporting multiple websites with different HTML structures.
 */
export interface IWebScraper{
    scrape(url: string) : Promise<Recipe>;
}