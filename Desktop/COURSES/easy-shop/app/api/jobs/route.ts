
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
  const initialData = [
    {
      id: '1',
      user: 'Madame Dupont',
      location: '5 Rue des Fleurs',
      items: ['Pain', 'Lait', 'Oeufs', 'Pommes'],
      reward: '5€',
      status: 'open',
      timestamp: Date.now() - 3600000 
    },
    {
      id: '2',
      user: 'Jean Pierre',
      location: '12 Avenue de la Liberté',
      items: ['Eau minérale (pack)', 'Pâtes', 'Sauce tomate'],
      reward: '3€',
      status: 'taken',
      timestamp: Date.now() - 7200000 
    }
  ];
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

function getJobs() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveJobs(jobs: any[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(jobs, null, 2));
}

export async function GET() {
  const jobs = getJobs();
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const jobs = getJobs();
  
  const newJob = {
    id: Date.now().toString(),
    status: 'open',
    timestamp: Date.now(),
    ...body
  };
  
  jobs.push(newJob);
  saveJobs(jobs);
  
  return NextResponse.json(newJob);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, status, ...updates } = body;
  const jobs = getJobs();
  
  const jobIndex = jobs.findIndex((j: any) => j.id === id);
  if (jobIndex === -1) {
    return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 });
  }

  const currentJob = jobs[jobIndex];

  // LOGIQUE ANTI-COLLISION / RACE CONDITION
  // Si un livreur tente d'accepter une mission (status: 'taken'), 
  // on vérifie qu'elle est toujours ouverte ('open').
  if (status === 'taken' && currentJob.status !== 'open') {
    return NextResponse.json({ 
      error: 'Désolé, cette mission a déjà été acceptée par un autre livreur.',
      status: currentJob.status 
    }, { status: 409 }); // 409 Conflict
  }

  // Mise à jour de la mission
  jobs[jobIndex] = { ...currentJob, status, ...updates };
  saveJobs(jobs);
  
  return NextResponse.json(jobs[jobIndex]);
}
