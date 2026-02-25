import fs from 'fs/promises';
import path from 'path';
import { db } from './firebaseAdmin';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

export interface Lead {
  id: string;
  name: string;
  title: string;
  source: string;
  url: string;
  domain?: string;
  logo?: string;
  email?: string;
  status: 'scraped' | 'enriched' | 'emailed' | 'linkedIn' | 'booked' | 'archived';
  date: string;
}

export async function initDb() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    try {
      await fs.access(dbPath);
    } catch {
      await fs.writeFile(dbPath, JSON.stringify({ leads: [] }), 'utf-8');
    }
  } catch (error) {
    console.error('Failed to init DB:', error);
  }
}

export async function getLeads(): Promise<Lead[]> {
  // If Firebase is available, we could fetch from there, but for speed we keep local as primary cache
  await initDb();
  const data = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(data).leads;
}

export async function saveLead(lead: Lead) {
  const leads = await getLeads();
  const index = leads.findIndex(l => l.url === lead.url);
  if (index >= 0) {
    leads[index] = { ...leads[index], ...lead };
  } else {
    leads.push(lead);
  }
  await fs.writeFile(dbPath, JSON.stringify({ leads }, null, 2));

  // Sync to Firebase
  if (db) {
    try {
      await db.collection('leads').doc(lead.id).set(lead, { merge: true });
      console.log(`Lead ${lead.name} synced to Firebase.`);
    } catch (e) {
      console.error('Firebase Sync Error:', e);
    }
  }
}

export async function updateLeadStatus(id: string, status: Lead['status'], email?: string) {
  const leads = await getLeads();
  const index = leads.findIndex(l => l.id === id);
  if (index >= 0) {
    leads[index].status = status;
    if (email !== undefined) leads[index].email = email;
    await fs.writeFile(dbPath, JSON.stringify({ leads }, null, 2));

    // Sync to Firebase
    if (db) {
      try {
        const updateData: any = { status };
        if (email !== undefined) updateData.email = email;
        await db.collection('leads').doc(id).update(updateData);
        console.log(`Lead status updated in Firebase.`);
      } catch (e) {
        console.error('Firebase Update Error:', e);
      }
    }
  }
}
