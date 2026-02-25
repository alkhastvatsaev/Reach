// Curated list of IT/Dev companies in Strasbourg/Alsace region
// These are real companies that hire developers and accept alternants

export interface TargetCompany {
  name: string;
  domain: string;
  sector: string;
  description: string;
  location: string;
  size: 'startup' | 'pme' | 'eti' | 'grand-groupe';
  alternanceRelevance: 'high' | 'medium' | 'low';
  tier: 1 | 2; // Tier 1: Top 50 (High risk/High reward), Tier 2: Mid-size/Agencies (Warmup)
}

export const STRASBOURG_DEV_COMPANIES: TargetCompany[] = [
  // === TIER 1 : TOP RECRUTEURS (À GARDER POUR PLUS TARD) === 
  {
    name: "Sopra Steria",
    domain: "soprasteria.com",
    sector: "ESN",
    description: "Leader européen du conseil et des services numériques.",
    location: "Strasbourg",
    size: "grand-groupe",
    alternanceRelevance: "high",
    tier: 1
  },
  {
    name: "CGI",
    domain: "cgi.com",
    sector: "ESN",
    description: "Conseil en technologies de l'information.",
    location: "Strasbourg",
    size: "grand-groupe",
    alternanceRelevance: "high",
    tier: 1
  },
  {
    name: "Capgemini",
    domain: "capgemini.com",
    sector: "ESN",
    description: "Leader mondial du conseil et de la transformation digitale.",
    location: "Strasbourg",
    size: "grand-groupe",
    alternanceRelevance: "high",
    tier: 1
  },
  {
    name: "OVHcloud",
    domain: "ovhcloud.com",
    sector: "Cloud / Infrastructure",
    description: "Leader européen du cloud.",
    location: "Strasbourg",
    size: "grand-groupe",
    alternanceRelevance: "medium",
    tier: 1
  },
  {
    name: "Hager Group",
    domain: "hagergroup.com",
    sector: "Industrie / IoT",
    description: "Leader en solutions électriques.",
    location: "Obernai (67)",
    size: "grand-groupe",
    alternanceRelevance: "medium",
    tier: 1
  },

  // === TIER 2 : AGENCES ET PME (IDÉAL POUR DÉMARRER) ===
  {
    name: "STUDIO JEUDI",
    domain: "studiojeudi.com",
    sector: "Agence Web",
    description: "Agence de développement web et mobile basée à Strasbourg.",
    location: "Strasbourg",
    size: "startup",
    alternanceRelevance: "high",
    tier: 2
  },
  {
    name: "Antistatique",
    domain: "antistatique.net",
    sector: "Agence Web",
    description: "Studio de design et développement web.",
    location: "Strasbourg",
    size: "startup",
    alternanceRelevance: "high",
    tier: 2
  },
  {
    name: "Novius",
    domain: "novius.com",
    sector: "Agence Web",
    description: "Agence digitale spécialisée dans le développement web.",
    location: "Strasbourg",
    size: "pme",
    alternanceRelevance: "high",
    tier: 2
  },
  {
    name: "Netdevices",
    domain: "netdevices.com",
    sector: "Agence Web / Mobile",
    description: "Développement d'applications mobile et web.",
    location: "Strasbourg",
    size: "startup",
    alternanceRelevance: "high",
    tier: 2
  },
  {
    name: "Actimage",
    domain: "actimage.com",
    sector: "ESN / Innovation",
    description: "Solutions innovantes, réalité mixte et IoT.",
    location: "Strasbourg",
    size: "pme",
    alternanceRelevance: "high",
    tier: 2
  },
  {
    name: "Geser-Best",
    domain: "geser-best.com",
    sector: "ESN / Ingénierie",
    description: "Bureau d'études en ingénierie.",
    location: "Strasbourg",
    size: "pme",
    alternanceRelevance: "high",
    tier: 2
  },
  {
    name: "PHAREA",
    domain: "pharea.com",
    sector: "ESN / Ingénierie",
    description: "Ingénierie pluridisciplinaire.",
    location: "Strasbourg",
    size: "pme",
    alternanceRelevance: "high",
    tier: 2
  },
  {
    name: "Smile",
    domain: "smile.eu",
    sector: "ESN / Open Source",
    description: "Leader européen de l'open source.",
    location: "Strasbourg",
    size: "eti",
    alternanceRelevance: "high",
    tier: 2
  },
  {
    name: "2le",
    domain: "2le.net",
    sector: "Agence Web",
    description: "Agence web experte Symfony et React à Strasbourg.",
    location: "Strasbourg",
    size: "pme",
    alternanceRelevance: "high",
    tier: 2
  },
  {
    name: "Blackthrone",
    domain: "blackthrone.com",
    sector: "Studio de développement",
    description: "Studio spécialisé dans les applications web haut de gamme.",
    location: "Strasbourg",
    size: "startup",
    alternanceRelevance: "high",
    tier: 2
  }
];

export function getTier2Companies(): TargetCompany[] {
  return STRASBOURG_DEV_COMPANIES.filter(c => c.tier === 2);
}

export function getAllCompanies(): TargetCompany[] {
  return STRASBOURG_DEV_COMPANIES;
}
