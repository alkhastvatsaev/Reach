import { NextResponse } from 'next/server';
import axios from 'axios';
import { updateLeadStatus } from '@/lib/db';
import { getCachedData, setCachedData } from '@/lib/redis';
import { findPersonEmail } from '@/lib/apollo';
import { predictAndVerifyEmail, deepScrapeEmail } from '@/lib/intelligence';

export async function POST(req: Request) {
  try {
    const { id, domain, name } = await req.json();

    if (!domain) {
      return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
    }

    // 1. Check Cache first (Mindset Apple: Speed)
    const cacheKey = `enrich:${domain}:${name || 'generic'}`;
    const cachedEmail = await getCachedData<string>(cacheKey);
    if (cachedEmail) {
      console.log(`Cache Hit: ${cachedEmail}`);
      await updateLeadStatus(id, 'enriched', cachedEmail);
      return NextResponse.json({ success: true, email: cachedEmail, cached: true });
    }

    let finalEmail = null;
    let method = "";

    // 2. LAYER 1: Apollo High-Precision Power Search
    if (process.env.APOLLO_API_KEY) {
      console.log(`Layer 1: Apollo Power Search for ${name}...`);
      finalEmail = await findPersonEmail(domain, name);
      if (finalEmail) method = "Apollo Power Search";
    }

    // 3. LAYER 2: Hunter.io Fallback
    if (!finalEmail && process.env.HUNTER_API_KEY) {
      console.log(`Layer 2: Hunter.io Search for ${domain}...`);
      const { data } = await axios.get(`https://api.hunter.io/v2/domain-search`, {
        params: { domain, limit: 10 },
        headers: { 'X-Api-Key': process.env.HUNTER_API_KEY }
      });

      if (data?.data?.emails?.length > 0) {
        // Try to find a match by name in Hunter results
        const nameMatch = name ? data.data.emails.find((e: any) => 
          e.first_name && name.toLowerCase().includes(e.first_name.toLowerCase())
        ) : null;
        
        finalEmail = nameMatch ? nameMatch.value : data.data.emails[0].value;
        method = nameMatch ? "Hunter.io (Name Match)" : "Hunter.io (Best Guess)";
      }
    }

    // 4. LAYER 3: Deep Web Scrape (Simulated AI Scraping)
    if (!finalEmail && name) {
      console.log(`Layer 3: Recursive Deep Web Scrape for ${name}...`);
      finalEmail = await deepScrapeEmail(name, domain);
      if (finalEmail) method = "Deep Web Intelligence";
    }

    // 5. LAYER 4: AI Heuristic Pattern Matching + Verification
    if (!finalEmail && name) {
      console.log(`Layer 4: AI Pattern Prediction Engine for ${name}...`);
      finalEmail = await predictAndVerifyEmail(domain, name);
      if (finalEmail) method = "AI Pattern Guessing";
    }

    // FINAL RESOLUTION
    if (finalEmail) {
      console.log(`✅ Success! [${method}] found: ${finalEmail}`);
      await setCachedData(cacheKey, finalEmail, 604800); // 1 week cache
      await updateLeadStatus(id, 'enriched', finalEmail);
      return NextResponse.json({ success: true, email: finalEmail, method });
    }

    return NextResponse.json({ 
      success: false, 
      error: `Imperative search failed for ${name} @ ${domain}. All 4 intelligence layers exhausted.` 
    });

  } catch (error: any) {
    console.error('Enrichment error:', error.response?.data || error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
