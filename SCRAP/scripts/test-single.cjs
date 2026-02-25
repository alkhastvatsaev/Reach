const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function run() {
    console.log("🚀 Lancement du test 'Deep Scan' pour STUDIO JEUDI...");
    
    try {
        const domain = "studiojeudi.com";
        const companyName = "STUDIO JEUDI";

        // 1. Étape Recherche de Contact (Deep Scan)
        console.log(`🔍 Recherche de contacts RH/Tech chez ${companyName}...`);
        const searchResponse = await axios.post(`${API_BASE}/employees`, {
            domain: domain,
            companyName: companyName
        });

        // Pour ce test, on va juste essayer d'en récupérer un si Apollo en a trouvé
        // Dans une vraie campagne, on itérerait sur tous les leads trouvés.
        let prospectName = "Responsable Recrutement";
        let targetEmail = "alkhastvatsaev@icloud.com"; // On garde ton email pour le test

        if (searchResponse.data.success && searchResponse.data.count > 0) {
            console.log(`✅ ${searchResponse.data.count} contacts trouvés !`);
            // Note: Le script /api/employees sauvegarde en DB. 
            // Ici pour le test, on va simuler qu'on a trouvé un nom précis.
            // On pourrait faire une requête à la DB ici, mais on va rester simple.
            prospectName = "Julien"; // Exemple de prénom trouvé (Studio Jeudi est une petite agence)
        } else {
            console.log("⚠️ Aucun contact précis trouvé, fallback sur greeting formel.");
        }

        // 2. Appel IA avec le contexte du prospect si on a son nom
        console.log("🤖 Appel à l'IA pour la Lettre de Motivation...");
        const aiResponse = await axios.post(`${API_BASE}/grok`, {
            name: companyName,
            domain: domain,
            prompt: `Rédige une candidature spontanée pour une alternance BTS SIO chez ${companyName}. Destinataire: ${prospectName}.`
        });

        const { copywriter, lm } = aiResponse.data.agents;

        // 3. Envoi Email avec le VRAI nom
        console.log(`📧 Envoi de l'email avec en-tête personnalisée pour: ${prospectName}...`);
        const emailResponse = await axios.post(`${API_BASE}/email`, {
            toEmail: targetEmail,
            prospectName: prospectName,
            companyName: companyName,
            icebreaker: copywriter,
            lm: lm
        });

        if (emailResponse.data.success) {
            console.log(`🎉 SUCCÈS ! Tu vas recevoir un email adressé à "${prospectName}".`);
        }
    } catch (e) {
        console.error("❌ Erreur:", e.response ? e.response.data : e.message);
    }
}

run();
