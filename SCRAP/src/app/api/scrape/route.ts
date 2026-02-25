import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { saveLead } from '@/lib/db';
import { searchApolloLeads } from '@/lib/apollo';

import { getTier2Companies } from '@/lib/companies';

export async function POST(req: Request) {
  try {
    const { keywords, location, type } = await req.json();

    // Strategy 0: Load Tier 2 Curated Companies
    if (type === 'tier2') {
      console.log("Loading Tier 2 Curated Database for Strasbourg...");
      const companies = getTier2Companies();
      for (let lead of companies) {
        await saveLead({
          id: uuidv4(),
          name: lead.name,
          title: "Alternance Développeur (Candidature Spontanée)",
          source: 'Tier-2',
          url: lead.domain,
          domain: lead.domain,
          status: 'scraped',
          date: new Date().toISOString()
        });
      }
      return NextResponse.json({ success: true, count: companies.length, method: 'Database' });
    }
    
    // Strategy 1: Apollo Search if API Key is present
    if (process.env.APOLLO_API_KEY) {
      console.log(`Using Apollo.io High-Performance Search for [${keywords}] in [${location}]`);
      const apolloLeads = await searchApolloLeads(keywords, location);
      
      if (apolloLeads.length > 0) {
        for (let lead of apolloLeads) {
          await saveLead({
            id: uuidv4(),
            name: lead.organizationName || 'Unknown Company',
            title: lead.title || 'Unknown Position',
            source: 'Apollo',
            url: lead.linkedinUrl || '',
            domain: lead.organizationDomain,
            email: lead.email,
            status: lead.email ? 'enriched' : 'scraped',
            date: new Date().toISOString()
          });
        }
        return NextResponse.json({ success: true, count: apolloLeads.length, method: 'Apollo' });
      }
    }

    // FALLBACK: Traditional Web Scraper (Public LinkedIn Jobs)
    console.log(`Apollo Key missing or no results. Falling back to LinkedIn Public Scraper...`);
    const url = `https://fr.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0`;
    
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    const jobs: any[] = [];
    
    $('.base-card').each((i, el) => {
      if (i >= 20) return;
      const title = $(el).find('.base-search-card__title').text().trim();
      const company = $(el).find('.base-search-card__subtitle').text().trim();
      const link = $(el).find('.base-card__full-link').attr('href');
      
      if (title && company) {
        jobs.push({ title, company, url: link });
      }
    });

    for (let job of jobs) {
      // Free Clearbit Domain lookup
      let domain = '';
      let logo = '';
      try {
        const enrichRes = await axios.get(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(job.company)}`);
        if (enrichRes.data?.length > 0) {
           domain = enrichRes.data[0].domain;
           logo = enrichRes.data[0].logo;
        }
      } catch (e) {}
      
      await saveLead({
        id: uuidv4(),
        name: job.company,
        title: job.title,
        source: 'LinkedIn',
        url: job.url || '',
        domain: domain,
        logo: logo,
        status: 'scraped',
        date: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ success: true, count: jobs.length, method: 'LinkedIn' });
    
  } catch (error: any) {
    console.error('Extraction error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
