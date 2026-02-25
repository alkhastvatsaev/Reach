import axios from 'axios';
import * as cheerio from 'cheerio';

interface FoundEmail {
  email: string;
  source: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export async function deepSearchEmails(domain: string, companyName: string): Promise<FoundEmail[]> {
  const emails: FoundEmail[] = [];
  const visited = new Set<string>();

  // Pages stratégiques à scanner (EmailHunter Pro Strategy)
  const paths = [
    '',
    '/contact',
    '/mentions-legales',
    '/recrutement',
    '/carrieres',
    '/about',
    '/legal'
  ];

  console.log(`🔍 Deep Search initiated for ${domain}...`);

  for (const path of paths) {
    try {
      const url = `https://${domain}${path}`;
      if (visited.has(url)) continue;
      visited.add(url);

      const response = await axios.get(url, { 
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      const $ = cheerio.load(response.data);
      const text = $('body').text();

      // Regex pour capturer les emails
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matches = text.match(emailRegex);

      if (matches) {
        matches.forEach(email => {
          const lowerEmail = email.toLowerCase();
          // Filtrage intelligent (EmailHunter Pro Rules)
          if (
            !lowerEmail.includes('wix') && 
            !lowerEmail.includes('sentry') && 
            !lowerEmail.includes('example') &&
            lowerEmail.endsWith(domain.replace('www.', ''))
          ) {
            let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
            
            if (lowerEmail.startsWith('rh@') || lowerEmail.startsWith('recrutement@') || lowerEmail.startsWith('jobs@')) {
              confidence = 'HIGH';
            } else if (lowerEmail.startsWith('contact@') || lowerEmail.startsWith('info@')) {
              confidence = 'MEDIUM';
            }

            if (!emails.find(e => e.email === lowerEmail)) {
              emails.push({ email: lowerEmail, source: url, confidence });
            }
          }
        });
      }
    } catch (e) {
      // On ignore les erreurs de pages non trouvées
    }
  }

  // Tri par confiance
  return emails.sort((a, b) => {
    const weights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return weights[b.confidence] - weights[a.confidence];
  });
}

/**
 * Tente de prédire le mail si rien n'est trouvé (Hunter style)
 */
export function predictPattern(firstName: string, lastName: string, domain: string, pattern = 'prenom.nom'): string {
  const f = firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const l = lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (pattern === 'prenom.nom') return `${f}.${l}@${domain}`;
  if (pattern === 'p.nom') return `${f[0]}.${l}@${domain}`;
  return `${f}@${domain}`;
}
