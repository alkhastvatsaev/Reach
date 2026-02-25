import { searchDomainEmails, findEmailForPerson } from './hunter';
import { deepSearchEmails } from './researcher';
import { getTechnicalTeam } from './apollo';
import { validateEmail } from './zerobounce';
import axios from 'axios';

interface DiscoveryResult {
  email: string | null;
  name: string;
  title: string;
  source: string;
  confidence: number;
}

const GROK_API_KEY = process.env.GROK_API_KEY;

/**
 * The 'Grok Strategy': Orchestrate all sources and use LLM to pick the winner.
 */
export async function runGrokDiscovery(companyName: string, domain: string): Promise<DiscoveryResult[]> {
  console.log(`🚀 Grok Discovery Engine starting for ${companyName}...`);
  
  // 1. Parallel Fetching (Lowest Latency)
  const [apolloleads, hunterEmails, crawlerEmails] = await Promise.all([
    getTechnicalTeam(domain),
    searchDomainEmails(domain),
    deepSearchEmails(domain, companyName)
  ]);

  const allPossibleleads: any[] = [];

  // Add Apollo folks
  if (apolloleads) {
    apolloleads.forEach(l => allPossibleleads.push({ ...l, source: 'Apollo' }));
  }

  // Add Hunter folks
  hunterEmails.forEach(h => {
    allPossibleleads.push({ 
      email: h.value, 
      source: 'Hunter.io', 
      confidence: h.confidence,
      title: 'Identified Contact'
    });
  });

  // Add Crawler folks
  crawlerEmails.forEach(c => {
    allPossibleleads.push({
      email: c.email,
      source: 'Web-Crawler',
      confidence: c.confidence === 'HIGH' ? 90 : 50,
      title: 'Public Contact'
    });
  });

  // 2. Intelligence: Filter and Rank via Grok/Gemini
  if (allPossibleleads.length > 0 && GROK_API_KEY && GROK_API_KEY !== 'test') {
    try {
      const prompt = `Analyze these potential leads for ${companyName} (${domain}). 
      Pick the TOP 3 most relevant emails for a job application in Development/IT.
      Return them as a JSON array of objects with {email, name, title, source, confidence}.
      
      Leads: ${JSON.stringify(allPossibleleads.slice(0, 15))}
      
      Reply ONLY with the JSON array.`;

      const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'google/gemini-2.0-flash-lite-001', // High speed, low cost
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: { 'Authorization': `Bearer ${GROK_API_KEY}` }
      });

      const text = res.data?.choices?.[0]?.message?.content;
      const cleanJson = text.match(/\[[\s\S]*\]/)?.[0];
      if (cleanJson) {
        return JSON.parse(cleanJson);
      }
    } catch (e) {
      console.error("Grok Intelligence failed, falling back to raw ranking.");
    }
  }

  // Fallback: Return raw list sorted by confidence
  return allPossibleleads
    .sort((a,b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 3);
}
