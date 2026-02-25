import axios from 'axios';

const HUNTER_API_KEY = process.env.HUNTER_API_KEY;
const BASE_URL = 'https://api.hunter.io/v2';

export interface HunterEmail {
  value: string;
  type: string;
  confidence: number;
  sources: { uri: string }[];
}

/**
 * Searches for all known emails for a domain.
 */
export async function searchDomainEmails(domain: string): Promise<HunterEmail[]> {
  if (!HUNTER_API_KEY) return [];

  try {
    const response = await axios.get(`${BASE_URL}/domain-search`, {
      params: {
        domain,
        api_key: HUNTER_API_KEY,
      },
    });

    return response.data.data.emails || [];
  } catch (error: any) {
    console.error('Hunter.io Search Error:', error.message);
    return [];
  }
}

/**
 * Specifically finds an email for a person at a company.
 */
export async function findEmailForPerson(firstName: string, lastName: string, domain: string): Promise<string | null> {
  if (!HUNTER_API_KEY) return null;

  try {
    const response = await axios.get(`${BASE_URL}/email-finder`, {
      params: {
        domain,
        first_name: firstName,
        last_name: lastName,
        api_key: HUNTER_API_KEY,
      },
    });

    const data = response.data.data;
    if (data && data.email && data.score > 50) {
      return data.email;
    }
  } catch (error: any) {
    console.error('Hunter.io Finder Error:', error.message);
  }

  return null;
}
