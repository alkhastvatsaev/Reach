import { NextResponse } from 'next/server';
import axios from 'axios';
import { enrichWithApollo } from '@/lib/apollo';

// Max execution time for deep analysis
export const maxDuration = 60;

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// === CANDIDATE CONTEXT FOR AI AGENTS ===
const CANDIDATE_CONTEXT = `
PROFIL DU CANDIDAT:
- Nom: Alkhast VATSAEV
- Formation: BTS SIO (Services Informatiques aux Organisations), option SLAM
- Localisation: 3 Rue Fred Vlès, 67000 Strasbourg
- Disponibilité: Recherche alternance pour la rentrée prochaine
- Compétences techniques: JavaScript/TypeScript, React.js/Next.js, Node.js, Python, Firebase/Firestore, SQL/PostgreSQL, Git/GitHub, API REST, HTML5/CSS3, Déploiement Vercel
- Expérience: Développement d'applications fullstack (React/Next.js, Node.js, Firebase), automatisation de workflows B2B, intégration d'APIs tierces, déploiement cloud
- Points forts: Polyvalence frontend/backend, montée en compétences rapide, capacité à livrer des projets de bout en bout
`;

async function callAIAgent(apiKey: string, systemPrompt: string, userPrompt: string) {
  if (!apiKey || apiKey === 'test') {
    throw new Error('API Key is missing or in test mode. Please provide a valid GROK_API_KEY.');
  }

  const isOpenRouter = apiKey.startsWith('sk-or-');
  const url = isOpenRouter ? OPENROUTER_API_URL : GROK_API_URL;
  const model = isOpenRouter ? 'google/gemini-2.0-flash-001' : 'grok-4-latest';

  try {
    const response = await axios.post(
      url,
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: model,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-Title': 'Reach Enterprise'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('AI API Error:', error.response?.data || error.message);
    throw new Error('AI processing failed. Check API limits and credentials.');
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, domain, name } = await req.json();
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'GROK_API_KEY is not defined.' }, { status: 401 });
    }

    // 1. Deep Enrichment (Apollo.io)
    let extraContext = "";
    if (domain && process.env.APOLLO_API_KEY) {
      console.log(`Deep enrichment for domain ${domain} via Apollo...`);
      const profile = await enrichWithApollo(domain, name);
      if (profile) {
        extraContext = `\n\nADDITIONAL CONTEXT (Person Insights):
        Title: ${profile.title}
        Bio: ${profile.bio}
        Social: LinkedIn ${profile.linkedinUrl || 'N/A'}, Github ${profile.githubUrl || 'N/A'}`;
      }
    }

    const enhancedPrompt = prompt + extraContext + "\n\n" + CANDIDATE_CONTEXT;

    // Orchestrate specialized agents for outreach
    const p1 = callAIAgent(
      apiKey, 
      `Tu es un expert en analyse du marché de l'emploi IT et de l'alternance en France. 
      Analyse cette entreprise et identifie :
      1. Si elle recrute des développeurs ou des alternants
      2. Ses besoins technologiques probables
      3. Les points de compatibilité avec un profil BTS SIO SLAM
      Réponds en 3-4 phrases maximum, en français.`, 
      enhancedPrompt
    );

    const p2 = callAIAgent(
      apiKey, 
      `Tu es un expert en rédaction de candidatures spontanées formelles en français.
      Écris un paragraphe d'accroche personnalisé (2-3 phrases).
      Le ton doit être professionnel et formel.
      NE PAS inclure de formule de politesse.`,
      enhancedPrompt
    );

    const p3 = callAIAgent(
      apiKey, 
      `Tu es un Lead Scorer spécialisé dans la recherche d'alternance.
      Évalue la compatibilité (0-100%) entre cette entreprise et un candidat BTS SIO SLAM.
      Réponds en 2 phrases maximum avec le score.`,
      enhancedPrompt
    );

    const p4 = callAIAgent(
      apiKey, 
      `Tu es un coach en recherche d'alternance IT. 
      Propose UNE stratégie concrète pour cette entreprise.`,
      enhancedPrompt
    );

    const p5 = callAIAgent(
      apiKey, 
      `Rédige une Lettre de Motivation (LM) unique et naturelle. 
      Mélange ton parcours Cartier et tes projets techniques (Reach/Hopla).`, 
      enhancedPrompt
    );

    const [analyst, copywriter, scorer, reviewer, lm] = await Promise.all([p1, p2, p3, p4, p5]);

    return NextResponse.json({
      success: true,
      agents: {
        analyst,
        copywriter,
        subject: `Candidature Alternance Développeur | Alkhast VATSAEV`,
        scorer,
        reviewer,
        lm
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
