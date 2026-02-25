# 🚀 Reach : L'Intelligence Artificielle au service de ma recherche d'alternance

> **Reach** n'est pas un simple outil de prospection. C'est le moteur que j'ai conçu pour automatiser, personnaliser et optimiser ma recherche d'alternance en BTS SIO SLAM.

---

## 💡 Le Concept

Plutôt que d'envoyer 100 CVs génériques qui finissent à la corbeille, **Reach** utilise une orchestration d'agents IA pour envoyer 10 candidatures **ultra-personnalisées**, adressées au bon contact, avec une lettre de motivation rédigée selon une analyse en temps réel de l'entreprise.

## 🛠️ Architecture Alpha (V2.0)

L'application repose sur un workflow complexe en 4 étapes clés :

### 1. Discovery (Apollo Deep Scan)

L'app scanne le domaine de l'entreprise ciblée (ex: `studiojeudi.com`) via l'API **Apollo.io** pour identifier les décideurs techniques (CTO, Lead Dev, RH). Elle récupère leurs noms, prénoms et emails directs.

### 2. Intelligence (Orchestration multi-agents)

Une fois la cible identifiée, Reach lance 5 agents IA spécialisés :

- **L'Analyste** : Scanne l'entreprise et définit son secteur/besoin.
- **Le Copywriter** : Rédige une accroche (pitch) courte et percutante.
- **L'Agent LM** : Rédige une Lettre de Motivation complète au format (VOUS / MOI / NOUS), faisant le pont entre mon passé chez **Cartier** (rigueur) et mon futur de **Développeur**.
- **Le Scoreur** : Évalue la pertinence de la candidature avant envoi.

### 3. Delivery (Gmail SMTP & Nodemailer)

L'email est envoyé directement depuis mon adresse Gmail professionnelle.

- **Personnalisation** : Prénom du recruteur en en-tête.
- **Engagement** : Lettre de motivation affichée directement dans le corps de l'email pour une lecture instantanée.
- **Pièce Jointe** : Mon CV PDF est automatiquement attaché.
- **Visibilité** : Support des Cc pour toucher plusieurs contacts dans la même boîte.

### 4. Pipeline & Control

Un dashboard minimaliste sous **Next.js** me permet de suivre l'état de chaque candidature en temps réel avec un système de logs type terminal ("Activity Engine").

---

## 🎯 Pourquoi avoir créé Reach ?

Ce projet démontre ma capacité à :

1. **Architecturer des solutions complexes** utilisant des APIs tierces (Apollo, Grok/OpenAI, Gmail).
2. **Maîtriser la stack Fullstack modern** (Next.js, Node.js, Firebase).
3. **Appliquer l'IA** à des problèmes concrets de productivité.

**Reach est la preuve que je ne cherche pas juste un job, je construis les outils pour réussir.**
