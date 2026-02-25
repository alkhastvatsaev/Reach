import { STRASBOURG_DEV_COMPANIES, TargetCompany } from '../src/lib/companies';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function launchCandidature(company: TargetCompany, testEmail?: string) {
  console.log(`\n🚀 Démarrage candidature pour : ${company.name} (${company.domain})`);
  
  try {
    // 1. Appel à l'IA (Grok)
    console.log(`🤖 Génération du contenu IA (Pitch + LM)...`);
    const aiResponse = await axios.post(`${API_BASE}/grok`, {
      name: company.name,
      domain: company.domain,
      prompt: `Rédige une candidature spontanée pour une alternance BTS SIO SLAM chez ${company.name} à Strasbourg. Secteur: ${company.sector}. Description: ${company.description}`
    });

    const { copywriter, lm } = aiResponse.data.agents;

    if (!copywriter || !lm) {
       console.error("❌ L'IA a retourné des champs vides.");
       return;
    }

    // 2. Envoi de l'email
    const targetEmail = testEmail || 'alkhastvatsaev@icloud.com';
    console.log(`📧 Envoi de l'email à : ${targetEmail}...`);
    
    await axios.post(`${API_BASE}/email`, {
      toEmail: targetEmail,
      prospectName: `Responsable Recrutement ${company.name}`,
      companyName: company.name,
      icebreaker: copywriter,
      lm: lm
    });

    console.log(`✅ Succès ! Candidature envoyée pour ${company.name}`);

  } catch (error: any) {
    console.error(`💥 Erreur pour ${company.name}:`, error.response?.data || error.message);
  }
}

// Lancement du test sur STUDIO JEUDI
const company = STRASBOURG_DEV_COMPANIES.find((c: TargetCompany) => c.name === 'STUDIO JEUDI');
if (company) {
  launchCandidature(company);
} else {
  console.error("Entreprise non trouvée.");
}
