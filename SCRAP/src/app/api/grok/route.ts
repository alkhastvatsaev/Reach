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
  const isFree = apiKey === 'test' || apiKey === 'free' || apiKey.startsWith('sk-or-');
  const url = isFree ? OPENROUTER_API_URL : GROK_API_URL;
  const model = isFree ? 'google/gemini-2.0-flash-lite-001' : 'grok-4-latest';
  
  if (apiKey === 'test') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (systemPrompt.includes('Analyst')) return "L'entreprise recrute activement des développeurs et montre un fort besoin en compétences web modernes (React, Node.js). Opportunité d'alternance très probable.";
    if (systemPrompt.includes('Copywriter')) return "Actuellement en préparation de mon BTS SIO option SLAM et passionné par le développement web, j'ai eu l'occasion de découvrir vos réalisations technologiques et je suis convaincu que mon profil fullstack (React/Next.js, Node.js, Firebase) correspond aux enjeux techniques de votre équipe.";
    if (systemPrompt.includes('Lead Scorer')) return "Score: 85% — L'entreprise est dans le secteur du développement logiciel et recrute dans la région de Strasbourg. Forte compatibilité avec le profil BTS SIO SLAM.";
    return "Stratégie recommandée : mettre en avant les projets personnels fullstack et la capacité d'adaptation rapide aux nouvelles technologies. Mentionner la disponibilité immédiate pour un entretien en présentiel à Strasbourg.";
  }

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
    console.error('AI API Error:', error.message);
    throw new Error('AI processing failed.');
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, domain, name } = await req.json();
    const apiKey = process.env.GROK_API_KEY || 'test';

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

    // Orchestrate 4 specialized agents for BTS SIO alternance outreach
    const p1 = callAIAgent(
      apiKey, 
      `Tu es un expert en analyse du marché de l'emploi IT et de l'alternance en France. 
      Analyse cette entreprise et identifie :
      1. Si elle recrute des développeurs ou des alternants
      2. Ses besoins technologiques probables
      3. Les points de compatibilité avec un profil BTS SIO SLAM
      Réponds en 3-4 phrases maximum, en français.`, 
      enhancedPrompt
    ).catch(e => "Analyse non disponible.");

    const p2 = callAIAgent(
      apiKey, 
      `Tu es un expert en rédaction de candidatures spontanées formelles en français pour des alternances en informatique.
      Écris un paragraphe d'accroche personnalisé (2-3 phrases) pour une candidature spontanée adressée à cette entreprise.
      Le ton doit être professionnel et formel, comme dans une lettre de motivation classique française.
      Mentionne les technologies pertinentes par rapport à l'activité de l'entreprise.
      NE PAS inclure de formule de politesse, NE PAS commencer par "Bonjour". Commence directement par le contenu.
      Exemple de style : "Actuellement en préparation de mon BTS SIO et passionné par le développement web, j'ai eu l'occasion de découvrir vos réalisations en [domaine] et je suis convaincu que mon profil correspond aux enjeux techniques de votre équipe."`,
      enhancedPrompt
    ).catch(e => "Passionné par le développement web et actuellement en formation BTS SIO, je serais ravi de mettre mes compétences au service de votre équipe technique.");

    const p3 = callAIAgent(
      apiKey, 
      `Tu es un Lead Scorer spécialisé dans la recherche d'alternance en développement informatique.
      Évalue la compatibilité (0-100%) entre cette entreprise et un candidat BTS SIO SLAM cherchant une alternance en développement.
      Critères : secteur d'activité (dev/IT), localisation (Strasbourg), taille, recrutement actif, technologies utilisées.
      Réponds en 2 phrases maximum avec le score et la justification.`,
      enhancedPrompt
    ).catch(e => "Score non disponible.");

    const p4 = callAIAgent(
      apiKey, 
      `Tu es un coach en recherche d'alternance IT. 
      Propose UNE stratégie concrète et actionnable pour maximiser les chances d'obtenir un entretien avec cette entreprise pour une alternance BTS SIO.
      Réponds en 2 phrases maximum, en français.`,
      enhancedPrompt
    ).catch(e => "Stratégie non disponible.");

    const p5 = callAIAgent(
      apiKey, 
      `Rédige une Lettre de Motivation (LM) unique. 
      IMPORTANT : Varie la structure. Ne commence pas toujours par "Passionné par...". 
      Utilise un ton naturel, comme si tu écrivais à un futur collègue. 
      Mélange ton parcours Cartier et ton code (Reach/Hopla) de façon fluide. 
      Pas de liste à puces, fais des paragraphes naturels.`, 
      enhancedPrompt
    ).catch(e => "LM en cours...");

    const [analyst, copywriterRes, scorer, reviewer, lm] = await Promise.all([p1, p2, p3, p4, p5]);

    let subject = `Candidature Alternance Développeur | Alkhast VATSAEV`;
    let pitch = copywriterRes;

    try {
      const parsed = JSON.parse(copywriterRes);
      subject = parsed.subject;
      pitch = parsed.pitch;
    } catch(e) {}

    return NextResponse.json({
      success: true,
      agents: {
        analyst,
        copywriter: pitch,
        subject,
        scorer,
        reviewer,
        lm
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
