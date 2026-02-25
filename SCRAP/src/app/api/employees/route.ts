import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { saveLead } from '@/lib/db';
import { runGrokDiscovery } from '@/lib/discovery';

export async function POST(req: Request) {
  try {
    const { domain, companyName } = await req.json();

    if (!domain) {
      return NextResponse.json({ success: false, error: 'Domain is required for Discovery.' }, { status: 400 });
    }

    console.log(`📡 Initiating Grok Intelligence Discovery for ${companyName}...`);
    
    // The Master Intelligence Call
    const results = await runGrokDiscovery(companyName, domain);

    // Save identified leads to database
    for (let res of results) {
      await saveLead({
        id: uuidv4(),
        name: res.name || companyName,
        title: res.title || 'Decision Maker',
        source: res.source,
        url: '',
        domain: domain,
        email: res.email || undefined,
        status: res.email ? 'enriched' : 'scraped',
        date: new Date().toISOString()
      });
    }

    return NextResponse.json({ 
      success: true, 
      count: results.length,
      leads: results,
      message: `Strategic discovery complete: ${results.length} high-confidence contacts identified.`
    });

  } catch (error: any) {
    console.error('Grok Discovery error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
