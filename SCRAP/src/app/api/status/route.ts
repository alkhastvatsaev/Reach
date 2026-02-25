import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const status: any = {
    apollo: { status: 'loading', quota: 'unknown' },
    hunter: { status: 'loading', quota: 'unknown' },
    grok: { status: 'loading', quota: 'unknown' },
    zerobounce: { status: 'loading', quota: 'unknown' },
    gmail: { status: 'loading' }
  };

  const tests = [];

  // 1. Test Apollo
  tests.push((async () => {
    try {
      const key = process.env.APOLLO_API_KEY;
      if (!key) throw new Error('Missing Key');
      // Simple lightweight call to verify key
      await axios.get('https://api.apollo.io/v1/auth/health', {
        headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' },
        params: { api_key: key }
      });
      status.apollo = { status: 'active' };
    } catch (e: any) {
      status.apollo = { status: 'error', message: e.response?.status === 401 ? 'Invalid Key' : 'Quota Refused or Error' };
    }
  })());

  // 2. Test Hunter.io + Quota
  tests.push((async () => {
    try {
      const key = process.env.HUNTER_API_KEY;
      if (!key) throw new Error('Missing Key');
      const res = await axios.get(`https://api.hunter.io/v2/account?api_key=${key}`);
      const calls = res.data.data.calls;
      status.hunter = { 
        status: 'active', 
        quota: `${calls.used}/${calls.available}`,
        percent: Math.round((calls.used / calls.available) * 100)
      };
    } catch (e: any) {
      status.hunter = { status: 'error', message: 'Quota Exceeded or Invalid Key' };
    }
  })());

  // 3. Test Grok / OpenRouter
  tests.push((async () => {
    try {
      const key = process.env.GROK_API_KEY;
      if (!key) throw new Error('Missing Key');
      const res = await axios.get('https://openrouter.ai/api/v1/auth/key', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      status.grok = { 
        status: 'active', 
        limit: res.data.data?.limit || 'No Limit',
        usage: res.data.data?.usage || 0
      };
    } catch (e: any) {
      status.grok = { status: 'error', message: 'Auth Failed' };
    }
  })());

  // 4. Test ZeroBounce
  tests.push((async () => {
    try {
      const key = process.env.ZEROBOUNCE_API_KEY;
      if (!key) throw new Error('Missing Key');
      const res = await axios.get(`https://api.zerobounce.net/v2/getcredits?api_key=${key}`);
      status.zerobounce = { 
        status: 'active', 
        credits: res.data.Credits || 0 
      };
    } catch (e: any) {
      status.zerobounce = { status: 'error', message: 'Invalid Key' };
    }
  })());

  // 5. Check Gmail Env
  status.gmail = {
    status: process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD ? 'configured' : 'missing'
  };

  await Promise.all(tests);

  return NextResponse.json(status);
}
