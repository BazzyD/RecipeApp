import { IWebScraper } from './IWebScraper';
import { EserDakotScraper } from './EserDakotScraper';

/**
 * Factory class for creating appropriate web scraper instances based on the target URL.
 * Supports multiple websites by returning a specific scraper implementation per domain.
 * 
 * Throws an error if the website is unsupported or scraper creation fails.
 */
export class WebScraperFactory {
     /**
   * Returns a scraper instance suitable for the given URL's hostname.
   * 
   * @param url - The recipe URL to scrape
   * @returns An instance of a class that implements IWebScraper
   * @throws If the site is unsupported or scraper instantiation fails
   */
    CreateScraper(url: string) : IWebScraper{
        const hostname = new URL(url).hostname;
        if (hostname === 'www.10dakot.co.il') {
            const scraper : IWebScraper = new EserDakotScraper();
            if (scraper)
                return scraper;
            throw new Error('error creating a scraper');
        }
        else {
            throw new Error('Unsupported website');
        }
    }}
