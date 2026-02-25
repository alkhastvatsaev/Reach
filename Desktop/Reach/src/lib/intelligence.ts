import axios from 'axios';
import { validateEmail } from './zerobounce';

/**
 * AI Email Intelligence
 * This module uses pattern recognition and recursive search to find emails.
 */

/**
 * Guess email patterns based on standard corporate structures
 */
export async function predictAndVerifyEmail(domain: string, name: string): Promise<string | null> {
  const [first, last] = name.toLowerCase().split(' ');
  if (!first || !last) return null;

  const patterns = [
    `${first}.${last}@${domain}`,
    `${first}@${domain}`,
    `${first[0]}${last}@${domain}`,
    `${first}${last[0]}@${domain}`,
    `${last}.${first}@${domain}`,
    `${first}_${last}@${domain}`
  ];

  console.log(`Deep Intelligence: Predicting patterns for ${name}...`);

  for (const pattern of patterns) {
    if (process.env.ZEROBOUNCE_API_KEY) {
      const v = await validateEmail(pattern);
      if (v.isValid && v.status === 'valid') {
        console.log(`Success! Pattern Matched & Verified: ${pattern}`);
        return pattern;
      }
    }
  }

  return null;
}

/**
 * AI-Assisted Deep Extraction
 * Uses LLM to identify emails in messy HTML content.
 */
export async function scrapeWithAI(html: string, name: string): Promise<string | null> {
  const grokKey = process.env.GROK_API_KEY;
  if (!grokKey || grokKey === 'test') return null;

  try {
    // We send a slice of HTML to avoid token limits
    // Note: Clean regex to avoid Turbopack parsing issues
    const textSnippet = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "").slice(0, 5000);
    
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'google/gemini-2.0-flash-lite-001',
      messages: [
        { role: 'system', content: 'You are an Expert Web Scraper. Extract ONLY the email address for the person mentioned in the user prompt from the HTML provided. If not found, reply "NONE".' },
        { role: 'user', content: `HTML:\n${textSnippet}\n\nTarget Person: ${name}` }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${grokKey}` }
    });

    const result = res.data?.choices?.[0]?.message?.content?.trim();
    if (result && result.includes('@')) return result;
  } catch (e: any) {
    console.warn("AI Scraping error:", e.message);
  }
  return null;
}

/**
 * Recursive Deep Web Scraper
 */
export async function deepScrapeEmail(name: string, domain: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`email contact "${name}" ${domain}`);
    const searchUrl = `https://www.google.com/search?q=${query}`;
    
    const { data: html } = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });

    // Try Regex first (Fast)
    const escapedDomain = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailRegex = new RegExp(`[a-zA-Z0-9._%+-]+@${escapedDomain}`, 'gi');
    const matches = html.match(emailRegex);
    if (matches && matches.length > 0) return matches[0];

    // Fallback: AI Vision (Deep)
    return await scrapeWithAI(html, name);
  } catch (e) {
    return null;
  }
}
