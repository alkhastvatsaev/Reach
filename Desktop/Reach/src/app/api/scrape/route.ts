import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { saveLead } from "@/lib/db";
import { searchApolloLeads } from "@/lib/apollo";
import { searchGoogleLeads } from "@/lib/google";

export async function POST(req: Request) {
  try {
    const { keywords, location, type } = await req.json();
    let leadsFound = 0;
    let methodUsed = "None";

    // Strategy 1: Apollo Search
    if (process.env.APOLLO_API_KEY) {
      console.log(`Analyzing market via Apollo for [${keywords}]...`);
      const apolloLeads = await searchApolloLeads(keywords, location);

      if (apolloLeads.length > 0) {
        for (let lead of apolloLeads) {
          await saveLead({
            id: uuidv4(),
            name: lead.organizationName || "Unknown Company",
            title: lead.title || "Unknown Position",
            source: "Apollo",
            url: lead.linkedinUrl || "",
            domain: lead.organizationDomain,
            email: lead.email,
            status: lead.email ? "enriched" : "scraped",
            date: new Date().toISOString(),
          });
        }
        leadsFound = apolloLeads.length;
        methodUsed = "Apollo";
      }
    }

    // Strategy 2: Google Scraping (Fallback)
    if (leadsFound === 0) {
      console.log(`Apollo zero results or unavailable. Falling back to Google Scraping for [${keywords}]...`);
      const googleLeads = await searchGoogleLeads(keywords, location);
      
      if (googleLeads.length > 0) {
        for (let lead of googleLeads) {
          await saveLead({
            id: uuidv4(),
            name: lead.companyName,
            title: "Decision Maker",
            source: "Google",
            url: "",
            domain: lead.domain,
            status: "scraped",
            date: new Date().toISOString(),
          });
        }
        leadsFound = googleLeads.length;
        methodUsed = "Google";
      }
    }

    if (leadsFound > 0) {
      return NextResponse.json({
        success: true,
        count: leadsFound,
        method: methodUsed,
      });
    }

    return NextResponse.json(
      { success: false, message: "No results found via Apollo or Google.", method: "None" },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("Discovery error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
