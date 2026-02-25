import axios from 'axios';

const PROXYCURL_API_KEY = process.env.PROXYCURL_API_KEY;

export interface LinkedInProfile {
  fullName: string;
  occupation: string;
  headline: string;
  summary: string;
  experiences: any[];
  skills: string[];
}

/**
 * Fetches rich professional data from LinkedIn via Proxycurl
 */
export async function getLinkedInProfileData(profileUrl: string): Promise<LinkedInProfile | null> {
  if (!PROXYCURL_API_KEY) {
    console.warn("Proxycurl API Key missing. Skipping rich enrichment.");
    return null;
  }

  try {
    const response = await axios.get('https://nubela.co/proxycurl/api/v2/linkedin', {
      params: {
        url: profileUrl,
        fallback_to_cache: 'on-error',
        use_cache: 'if-present',
      },
      headers: {
        'Authorization': `Bearer ${PROXYCURL_API_KEY}`
      }
    });

    return {
      fullName: response.data.full_name,
      occupation: response.data.occupation,
      headline: response.data.headline,
      summary: response.data.summary,
      experiences: response.data.experiences || [],
      skills: response.data.skills || [],
    };
  } catch (error: any) {
    console.error("Proxycurl Error:", error.response?.data || error.message);
    return null;
  }
}
