import axios from 'axios';

const ZEROBOUNCE_API_KEY = process.env.ZEROBOUNCE_API_KEY;

export async function validateEmail(email: string): Promise<{ isValid: boolean; status: string }> {
  if (!ZEROBOUNCE_API_KEY) {
    console.warn("ZeroBounce API Key missing. Skipping validation.");
    return { isValid: true, status: 'skipped' }; // Bypass in dev
  }

  try {
    const response = await axios.get('https://api.zerobounce.net/v2/validate', {
      params: {
        api_key: ZEROBOUNCE_API_KEY,
        email: email,
        ip_address: ''
      }
    });

    // ZeroBounce statuses: valid, invalid, catch-all, unknown, spamtrap, abuse, do_not_mail
    const status = response.data.status || 'unknown';
    // Accept valid, catch-all (corporate servers), and unknown (iCloud, etc.)
    const isValid = ['valid', 'catch-all', 'unknown'].includes(status);

    return { isValid, status };
  } catch (error: any) {
    console.error("ZeroBounce Error:", error.message);
    return { isValid: true, status: 'error' }; // Fail open for business continuity
  }
}
