import axios from 'axios';
import * as cheerio from 'cheerio';

export interface GoogleLead {
  companyName: string;
  domain: string;
  title: string;
  source: string;
}

/**
 * Professional Google Search Scraper
 * Uses a search API if available, otherwise falls back to a custom scrap logic.
 */
export async function searchGoogleLeads(keywords: string, location: string): Promise<GoogleLead[]> {
  const serperKey = process.env.SERPER_API_KEY;
  
  // Method 1: Serper.dev (Ultra-Reliable & Recommended)
  if (serperKey) {
    console.log("Using Serper.dev for surgical Google Discovery...");
    try {
      const response = await axios.post('https://google.serper.dev/search', {
        q: `${keywords} ${location} site:linkedin.com/company OR site:facebook.com`,
        num: 15
      }, {
        headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' }
      });

      return (response.data.organic || []).map((res: any) => {
        const domain = res.link.split('/')[2].replace('www.', '');
        return {
          companyName: res.title.split(' - ')[0].split(' | ')[0],
          domain: domain === 'linkedin.com' ? '' : domain,
          title: res.snippet.substring(0, 60) + '...',
          source: 'Google (Serper)'
        };
      });
    } catch (e) {
      console.error("Serper API Error, falling back to raw scraping...");
    }
  }

  // Method 2: Raw Google Scraping (Last Resort)
  console.log("Using Raw Google Scraping for discovery...");
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keywords + ' ' + location + ' e-mail entreprise')}&num=20`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const $ = cheerio.load(data);
    const leads: GoogleLead[] = [];

    // Parsing organic results
    $('div.g').each((_, el) => {
      const title = $(el).find('h3').text();
      const link = $(el).find('a').attr('href');
      const snippet = $(el).find('div.VwiC3b').text();

      if (link && !link.includes('google.com') && !link.includes('youtube.com')) {
        const url = new URL(link);
        const domain = url.hostname.replace('www.', '');
        
        leads.push({
          companyName: title.split(' - ')[0].split(' | ')[0].trim(),
          domain: domain,
          title: snippet.substring(0, 100).trim() || 'Site Web Entreprise',
          source: 'Google (Raw)'
        });
      }
    });

    // Filtering duplicates and non-relevant domains
    return leads.filter((l, i, self) => 
      l.domain && 
      !['linkedin.com', 'facebook.com', 'instagram.com'].includes(l.domain) &&
      self.findIndex(t => t.domain === l.domain) === i
    ).slice(0, 10);

  } catch (error: any) {
    console.error("Google Scraping Error:", error.message);
    return [];
  }
}
