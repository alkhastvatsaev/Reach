# AltScout Enterprise - Project Architecture

## Overview

AltScout Enterprise is a high-performance outbound automation platform designed for B2B acquisition. It automates the entire funnel: from finding new leads to sending personalized, AI-generated outreach campaigns.

## Core Technology Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Apple/Vercel Enterprise Design System)
- **Database**:
  - Local JSON (`data/db.json`) for rapid caching.
  - Firebase Firestore (Admin SDK) for persistent cloud operations.
- **Outreach**: Resend API
- **Enrichment**: Hunter.io API (Professional Email Discovery)
- **AI Orchestration**: xAI Grok 4.20 (Multi-Agent Architecture)

## Key Modules

### 1. Data Extraction Engine (`/api/scrape`)

- **Source**: Public LinkedIn Job search.
- **Logic**: Uses `axios` and `cheerio` to parse real-time job offers without the need for expensive LinkedIn API keys.
- **Initial Enrichment**: Uses Clearbit Autocomplete to resolve company domains and find logos by company name.

### 2. B2B Enrichment Layer (`/api/enrich`)

- **Service**: Hunter.io
- **Logic**: Takes a company domain (e.g., `stripe.com`) and queries Hunter's Domain Search API.
- **Filtering**: Specifically targets "Senior/Executive" roles in "Engineering, IT, and HR" to ensure the e-mail belongs to a decision-maker.

### 3. Grok Multi-Agent AI (`/api/grok`)

- **Model**: `grok-4-latest` (xAI) or **Mistral 7B (Free via OpenRouter)**.
- **Developer Test Mode**: By using the key `test`, the application enters a zero-cost simulation mode that mimics AI behavior for rapid UI testing.
- **Parallel Processing**: Triggers 4 agents concurrently using `Promise.all`:
  - **Agent 1 (Market Analyst)**: Identifies company pain points.
  - **Agent 2 (Lead Scorer)**: Matches the lead with the user's profile (BTS SIO).
  - **Agent 3 (Copywriter)**: Generates high-converting, personalized cold e-mails.
  - **Agent 4 (QA Reviewer)**: Final review of the strategy and tone.

### 4. Communication Engine (`/api/email`)

- **Service**: Resend
- **Feature**: Sends e-mails via the Resend SDK with campgain tracking.
- **Templates**: Uses dynamic HTML templates that inject AI-generated icebreakers into professional pitches.

### 5. Persistence Layer (`src/lib/db.ts` & `src/lib/firebaseAdmin.ts`)

- **LocalDB**: Atomic JSON file updates for immediate speed.
- **Firebase**: Global sync using Firebase Admin SDK for secure, server-side data management.

## Project Structure

```text
src/
├── app/
│   ├── api/          # Backend Routes (Scraper, AI, Email, Enrich)
│   ├── layout.tsx    # Root Layout & Global Styles
│   └── page.tsx      # Enterprise Dashboard (Frontend Logic)
├── lib/
│   ├── db.ts         # Local JSON Database Logic
│   ├── firebaseAdmin.ts # Firebase Admin SDK Hub
├── data/
│   └── db.json       # Lead Storage
└── globals.css       # Sober Enterprise Design tokens
```

## Infrastructure & Deployment (Vercel)

Reach is designed for **Vercel Serverless** deployment:

- **Max Execution Time**: Extended to 60s (via `vercel.json`) to allow Grok Multi-Agent orchestration to finish without timeouts.
- **Regional Edge Routing**: Configured on `cdg1` (Paris) for low-latency European operations.

## Ultra-Performance Power Stack (Next Steps)

To reach maximum B2B scale, the following services can be connected:

1. **Upstash Redis (Serverless Caching & Rate Limiting)**:
   - Prevents burned credits by caching Hunter.io & Grok results.
   - Implements global rate-limiting to protect API budgets.
2. **Proxycurl API (Advanced Person Enrichment)**:
   - Replaces public scraping for rich LinkedIn profile data.
   - Fetches work history and skills for "Hyper-Personalized" outreach.

3. **Sentry (Observability & Reliability)**:
   - Live error tracking for 24/7 autonomous prospecting.
   - Alerts if outreach sequences fail or if an API key reaches its limit.

4. **Vercel Analytics & Speed Insights**:
   - Real-time monitoring of dashboard performance and user interaction.
