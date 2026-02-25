import axios from 'axios';

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;

export interface ApolloLeadData {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title?: string;
  organizationName?: string;
  organizationDomain?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  industry?: string;
  employeeCount?: number;
}

/**
 * Apollo.io Search - Finding high-value targets directly from their database.
 */
export async function searchApolloLeads(keywords: string, location: string): Promise<ApolloLeadData[]> {
  if (!APOLLO_API_KEY) {
    console.warn("Apollo API Key missing. Skipping cloud search.");
    return [];
  }

  try {
    const response = await axios.post('https://api.apollo.io/v1/people/search', 
      {
        q_keywords: keywords,
        person_locations: [location],
        page: 1,
        per_page: 25
      },
      {
        headers: {
          'X-Api-Key': APOLLO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return (response.data.people || []).map((p: any) => ({
      id: p.id,
      email: p.email,
      firstName: p.first_name,
      lastName: p.last_name,
      fullName: p.name,
      title: p.title,
      organizationName: p.organization?.name,
      organizationDomain: p.organization?.primary_domain,
      linkedinUrl: p.linkedin_url,
      city: p.city,
      industry: p.organization?.industry,
      employeeCount: p.organization?.estimated_num_employees
    }));
  } catch (error: any) {
    console.error("Apollo Search Error:", error.response?.data || error.message);
    return [];
  }
}

/**
 * Apollo "Deep Scan" - Find the technical decision makers in a company
 */
export async function getTechnicalTeam(domain: string): Promise<ApolloLeadData[]> {
  if (!APOLLO_API_KEY || !domain) return [];

  try {
    const response = await axios.post('https://api.apollo.io/v1/people/search', 
      {
        q_organization_domains: domain,
        person_titles: [
          "CTO", "Chief Technology Officer", "VP Engineering", "Head of IT", 
          "Engineering Manager", "Lead Developer", "Software Architect",
          "Technical Lead", "HR Manager", "Talent Acquisition"
        ],
        page: 1,
        per_page: 15
      },
      {
        headers: {
          'X-Api-Key': APOLLO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return (response.data.people || []).map((p: any) => ({
      id: p.id,
      email: p.email,
      firstName: p.first_name,
      lastName: p.last_name,
      fullName: p.name,
      title: p.title,
      organizationName: p.organization?.name,
      organizationDomain: p.organization?.primary_domain,
      linkedinUrl: p.linkedin_url,
      city: p.city,
      bio: p.headline
    }));
  } catch (error: any) {
    console.error("Apollo Team Scan Error:", error.message);
    return [];
  }
}

/**
 * Apollo.io Enrichment - Match a specific profile
 */
export async function enrichWithApollo(domain: string, personName?: string): Promise<ApolloLeadData | null> {
  if (!APOLLO_API_KEY) return null;

  try {
    const response = await axios.post('https://api.apollo.io/v1/people/match', 
      {
        domain: domain,
        name: personName,
        reveal_personal_emails: true
      },
      {
        headers: {
          'X-Api-Key': APOLLO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const person = response.data.person;
    if (!person) return null;

    return {
      email: person.email,
      fullName: person.name,
      title: person.title,
      organizationName: person.organization?.name,
      organizationDomain: person.organization?.primary_domain,
      linkedinUrl: person.linkedin_url,
      twitterUrl: person.twitter_url,
      githubUrl: person.github_url,
      bio: person.headline
    };
  } catch (error: any) {
    console.error("Apollo Enrichment Error:", error.response?.data || error.message);
    return null;
  }
}

/**
 * Apollo "Power Search" - Try multiple angles to find an email
 */
export async function findPersonEmail(domain: string, name: string): Promise<string | null> {
  if (!APOLLO_API_KEY) return null;

  try {
    // Stage 1: Direct Match
    const match = await enrichWithApollo(domain, name);
    if (match?.email) return match.email;

    // Stage 2: People Search with specific filters
    const searchRes = await axios.post('https://api.apollo.io/v1/people/search', {
      api_key: APOLLO_API_KEY,
      q_organization_domains: domain,
      q_keywords: name,
      page: 1,
      reveal_personal_emails: true
    });

    const person = searchRes.data.people?.[0];
    return person?.email || null;
  } catch (e) {
    return null;
  }
}
