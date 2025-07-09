
import { EserDakotScraper } from './EserDakotScraper';
import { IWebScraper } from './IWebScraper';

export class WebScraperFactory {
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
