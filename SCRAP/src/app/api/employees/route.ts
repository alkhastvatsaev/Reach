import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { saveLead } from '@/lib/db';
import { getTechnicalTeam } from '@/lib/apollo';

/**
 * Deep Scan: Fetch all technical decision makers for a given company domain.
 * This effectively "explodes" one company into multiple high-value leads.
 */
export async function POST(req: Request) {
  try {
    const { domain, companyName } = await req.json();

    if (!domain) {
      return NextResponse.json({ success: false, error: 'Domain is required for Deep Scan.' }, { status: 400 });
    }

    console.log(`Starting Technical Deep Scan for ${companyName} (${domain})...`);
    
    // Apollo Multi-Agent Fetch
    const employees = await getTechnicalTeam(domain);
    
    if (!employees || employees.length === 0) {
      return NextResponse.json({ success: false, error: 'No technical leads found for this organization.' });
    }

    // Save each employee as a new lead
    for (let emp of employees) {
      await saveLead({
        id: uuidv4(),
        name: emp.fullName || companyName, // Individual name
        title: emp.title || 'Decision Maker',
        source: 'Apollo-DeepScan',
        url: emp.linkedinUrl || '',
        domain: domain,
        email: emp.email,
        status: emp.email ? 'enriched' : 'scraped',
        date: new Date().toISOString()
      });
    }

    return NextResponse.json({ 
      success: true, 
      count: employees.length,
      message: `${employees.length} technical decision makers identified and added to pipeline.`
    });

  } catch (error: any) {
    console.error('Deep Scan error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
