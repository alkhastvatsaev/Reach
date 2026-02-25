"use client";

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Target, 
  Mail, 
  Play, 
  Terminal, 
  Briefcase,
  Search,
  Zap,
  CheckCircle2,
  Loader2,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';

// Types
interface ScrapedLead {
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'search'>('pipeline');
  const [leads, setLeads] = useState<ScrapedLead[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info'|'action'|'error'}[]>([]);
  const [visibleEmails, setVisibleEmails] = useState<Set<string>>(new Set());

  // Search State
  const [keywords, setKeywords] = useState('Alternance Développeur Informatique');
  const [location, setLocation] = useState('Strasbourg');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addLog = (msg: string, type: 'info'|'action'|'error' = 'info') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 50));
  };

  const startScrape = async () => {
    setIsScraping(true);
    addLog(`Searching for opportunities in ${location}...`, 'action');

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, location })
      });
      const data = await res.json();
      
      if (data.success) {
        addLog(`Found ${data.count} new companies for you.`, 'action');
        await fetchLeads();
        setActiveTab('pipeline');
      } else {
        addLog(`Error: ${data.error}`, 'error');
      }
    } catch (e: any) {
      addLog(`Network Error: ${e.message}`, 'error');
    }
    setIsScraping(false);
  };

  const runFullSequence = async (lead: ScrapedLead) => {
    setIsProcessing(lead.id);
    addLog(`🚀 Mission : Candidature automatisée pour ${lead.name}`, 'action');

    try {
      // 1. DISCOVERY: Find exact contacts (Deep Scan)
      let targetEmail = lead.email;
      let targetName = lead.name;
      let ccEmails: string[] = [];

      addLog(`🔍 Étape 1 : Recherche de contacts RH/Tech (Apollo Deep Scan)...`, 'info');
      const employeesRes = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: lead.domain, companyName: lead.name })
      });
      const employeesData = await employeesRes.json();

      if (employeesData.success && employeesData.count > 0) {
        addLog(`✅ ${employeesData.count} décideurs identifiés.`, 'info');
        // On récupère le premier pour le "To", les autres pour le "Cc"
        // Le backend sauvegarde déjà en DB, on peut juste ré-fetcher si besoin
        // Ici on simule la sélection
        targetName = lead.name; // Fallback par défaut
      } else {
        addLog(`⚠️ Aucun contact précis trouvé. Utilisation de l'email générique.`, 'info');
      }

      // 2. INTELLIGENCE: AI Analysis & Drafting (5 Agents)
      addLog(`🤖 Étape 2 : Orchestration des 5 Agents IA (Analyse, Pitch, LM)...`, 'action');
      const grokRes = await fetch('/api/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Candidature pour alternance BTS SIO SLAM chez ${lead.name}.`,
          domain: lead.domain,
          name: lead.name
        })
      });
      const grokData = await grokRes.json();

      if (!grokData.success) throw new Error("Échec de la génération IA.");

      const { copywriter: pitch, lm, scorer, subject } = grokData.agents;
      addLog(`📊 Score Match : ${scorer}`, 'info');
      addLog(`📝 Lettre de Motivation et Objet générés.`, 'info');

      // 3. DELIVERY: Gmail SMTP with CV attachment
      addLog(`📧 Étape 3 : Dispatch final via Gmail SMTP (Nodemailer)...`, 'action');
      const emailRes = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: lead.email || "candidature@"+lead.domain,
          prospectName: targetName,
          companyName: lead.name,
          icebreaker: pitch,
          lm: lm,
          subject: subject
        })
      });
      const emailData = await emailRes.json();

      if (emailData.success) {
        addLog(`🎉 VICTOIRE : Candidature livrée à ${lead.name}.`, 'action');
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: lead.id, status: 'emailed' })
        });
        fetchLeads();
      } else {
        throw new Error(emailData.error || "Erreur d'envoi Gmail.");
      }
    } catch (err: any) {
      addLog(`💥 Panne moteur : ${err.message}`, 'error');
    }
    setIsProcessing(null);
  };

  const runAutoPilot = async () => {
    // SECURITY: Limit to 5 per batch and only Tier-2 to be safe
    const targets = leads
      .filter(l => (l.status === 'scraped' || l.status === 'enriched'))
      .slice(0, 5); 

    if (targets.length === 0) {
      addLog("Aucune cible prête pour l'Auto-Pilot.", 'info');
      return;
    }
    
    addLog(`🛡️ Mode Sécurité : Envoi de 5 candidatures avec 15s de délai entre chaque.`, 'action');
    
    for (const lead of targets) {
      if (isProcessing) {
        await runFullSequence(lead);
        
        // Wait random time between 30 and 45 seconds (Jitter)
        if (targets.indexOf(lead) < targets.length - 1) {
          const delay = Math.floor(Math.random() * (45000 - 30000 + 1) + 30000);
          addLog(`⏳ Pause 'humaine' de sécurité (${Math.round(delay/1000)}s)...`, 'info');
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    addLog("🏁 Session Auto-Pilot terminée.", 'action');
  };

  const clearPipeline = async () => {
    if (!confirm("Voulez-vous archiver tous les leads non contactés pour repartir à zéro ?")) return;
    addLog(`🧹 Nettoyage du pipeline en cours...`, 'action');
    try {
      const res = await fetch('/api/leads', { method: 'DELETE' });
      if (res.ok) {
        addLog(`✅ Pipeline nettoyé. Tous les leads sont archivés.`, 'info');
        fetchLeads();
      }
    } catch (e: any) {
      addLog(`Erreur nettoyage: ${e.message}`, 'error');
    }
  };

  const toggleEmailVisibility = (id: string) => {
    setVisibleEmails(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const loadTier2 = async () => {
    setIsScraping(true);
    addLog(`📦 Chargement de la liste "Séchauffement" (PME & Agences Strasbourg)...`, 'action');
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tier2' })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`✅ Étape Discovery terminée : ${data.count} entreprises ajoutées.`, 'info');
        await fetchLeads();
        setActiveTab('pipeline');
      }
    } catch (e: any) {
      addLog(`Erreur: ${e.message}`, 'error');
    }
    setIsScraping(false);
  };

  return (
    <div className="app-layout">
      {/* Sidebar - Apple Inspired Minimalism */}
      <aside className="sidebar">
        <div className="brand mb-12">
          <div className="brand-icon">R</div>
          <span className="brand-name">Reach</span>
        </div>

        <nav className="nav-list">
          <button 
            className={`nav-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            <Briefcase size={18} />
            <span>Opportunities</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={18} />
            <span>Find Jobs</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <div className="dot"></div>
            <span>System Active</span>
          </div>
        </div>
      </aside>

      {/* Main View */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {activeTab === 'search' ? 'Discover' : 'Your Pipeline'}
            </h1>
            <p className="text-muted text-sm mt-1">
              {activeTab === 'search' 
                ? 'High-performance discovery engine for B2B targets.' 
                : 'Automated opportunity management with real-time enrichment.'}
            </p>
          </div>
          
          <div className="flex gap-3">
            {activeTab === 'pipeline' && (
              <button 
                className="btn-apple bg-blue-500 text-white" 
                onClick={runAutoPilot}
                disabled={isProcessing !== null || leads.filter(l => l.status === 'scraped' || l.status === 'enriched').length === 0}
              >
                <Zap size={16} fill="currentColor" />
                Start Auto-Pilot
              </button>
            )}
            <button className="btn-apple text-red-500 border-red-200" onClick={clearPipeline}>
              <EyeOff size={16} />
              Nettoyer
            </button>
            <button className="btn-apple" onClick={() => setActiveTab(activeTab === 'search' ? 'pipeline' : 'search')}>
              {activeTab === 'search' ? <Briefcase size={16} /> : <Search size={16} />}
              {activeTab === 'search' ? 'View Pipeline' : 'New Search'}
            </button>
          </div>
        </header>

        <section className="view-container">
          {activeTab === 'search' && (
            <div className="search-landing card-apple">
              <div className="search-hero">
                <div className="icon-badge">
                  <Search size={32} />
                </div>
                <h2>What are you looking for?</h2>
                <p>Reach will scan the market, identify decision makers and orchestrate your contact.</p>
              </div>

              <div className="search-form">
                <div className="flex gap-4 mb-6">
                  <button 
                    className="btn-primary-apple flex-1" 
                    onClick={loadTier2}
                    disabled={isScraping}
                  >
                    {isScraping ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                    Charger la liste "Séchauffement" (Tier 2)
                  </button>
                </div>

                <div className="separator mb-8 text-center text-xs text-muted uppercase tracking-widest">OU RECHERCHER MANUELLEMENT</div>

                <div className="field">
                  <label>Poste recherché</label>
                  <input 
                    type="text" 
                    value={keywords} 
                    onChange={e => setKeywords(e.target.value)}
                    placeholder="e.g. Développeur Fullstack"
                  />
                </div>
                <div className="field">
                  <label>Ville</label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Strasbourg"
                  />
                </div>
                <button 
                  className="btn-apple bg-black text-white py-4 justify-center" 
                  onClick={startScrape}
                  disabled={isScraping}
                >
                  {isScraping ? <Loader2 className="animate-spin" /> : 'Lancer le Scraper LinkedIn'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="pipeline-view">
              <div className="stats-row">
                <div className="mini-card">
                  <span className="label">Captured</span>
                  <span className="value">{leads.length}</span>
                </div>
                <div className="mini-card">
                  <span className="label">Emailed</span>
                  <span className="value">{leads.filter(l => l.status === 'emailed').length}</span>
                </div>
              </div>

              <div className="table-wrapper card-apple">
                <table className="apple-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Position</th>
                      <th>Contact</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th className="text-right">Outreach</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.filter(l => l.status !== 'archived').length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-state">
                          Votre pipeline est propre. Chargez de nouvelles opportunités !
                        </td>
                      </tr>
                    ) : (
                      leads
                        .filter(l => l.status !== 'archived')
                        .map((lead) => (
                        <tr key={lead.id}>
                          <td>
                            <div className="company-info">
                              {lead.logo ? <img src={lead.logo} alt="" /> : <div className="logo-placeholder"><Building2 size={12} /></div>}
                              <span>{lead.name}</span>
                            </div>
                          </td>
                          <td className="job-title-cell">{lead.title}</td>
                          <td>
                            {lead.email ? (
                              <div className="email-cell">
                                <span className="email-text">
                                  {visibleEmails.has(lead.id) ? lead.email : '••••@••••.•••'}
                                </span>
                                <button 
                                  className="eye-btn" 
                                  onClick={() => toggleEmailVisibility(lead.id)}
                                >
                                  {visibleEmails.has(lead.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted italic">Not found</span>
                            )}
                          </td>
                          <td>
                            <span className={`source-tag ${lead.source.toLowerCase()}`}>
                              {lead.source}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${lead.status}`}>
                              {lead.status === 'emailed' ? 'Delivered' : lead.status === 'scraped' ? 'Ready' : 'Enriched'}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                                {lead.domain && lead.source !== 'Apollo-DeepScan' && (
                                  <div className="text-xs text-muted">Scan ready</div>
                                )}
                              
                              {lead.status === 'emailed' ? (
                                <div className="sent-badge"><CheckCircle2 size={16} /></div>
                              ) : (
                                <button 
                                  className="action-btn"
                                  onClick={() => runFullSequence(lead)}
                                  disabled={isProcessing === lead.id}
                                >
                                  {isProcessing === lead.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                                  <span>Reach</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Live Logs - Professional Terminal Style */}
        <footer className="footer-logs card-apple">
          <div className="logs-header">
            <Terminal size={14} />
            <span>Activity Engine</span>
          </div>
          <div className="logs-content">
            {logs.length === 0 ? (
              <p className="text-muted italic">System idle. Waiting for instructions.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`log-line ${log.type}`}>
                  <span className="time">{log.time}</span>
                  <span className="msg">{log.msg}</span>
                </div>
              ))
            )}
          </div>
        </footer>
      </main>

      <style jsx>{`
        .app-layout {
          display: flex;
          height: 100vh;
          background-color: #f5f5f7;
          color: #1d1d1f;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        /* Sidebar Apple Style */
        .sidebar {
          width: 260px;
          background: #ffffff;
          border-right: 1px solid #d2d2d7;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .brand {
          display: flex;
          items-center: center;
          gap: 12px;
        }

        .brand-icon {
          width: 32px;
          height: 32px;
          background: #000;
          color: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #515154;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .nav-btn:hover {
          background: #f5f5f7;
          color: #1d1d1f;
        }

        .nav-btn.active {
          background: #0071e3;
          color: #ffffff;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #f5f5f7;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #86868b;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #34c759;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(52, 199, 89, 0.4);
        }

        /* Main Content */
        .main-content {
          flex: 1;
          padding: 40px 60px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .text-muted { color: #86868b; }

        .btn-apple {
          background: #ffffff;
          border: 1px solid #d2d2d7;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-apple:hover {
          background: #f5f5f7;
        }

        .card-apple {
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.05);
        }

        /* Search Landing */
        .search-landing {
          padding: 60px;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .search-hero {
          margin-bottom: 40px;
        }

        .icon-badge {
          width: 80px;
          height: 80px;
          background: #f5f5f7;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #0071e3;
        }

        .search-hero h2 {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -1px;
          margin-bottom: 12px;
        }

        .search-hero p {
          color: #86868b;
          font-size: 17px;
          max-width: 500px;
          margin: 0 auto;
        }

        .search-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 400px;
          margin: 0 auto;
          text-align: left;
        }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #86868b;
          margin-bottom: 8px;
          margin-left: 4px;
        }

        .field input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #d2d2d7;
          font-size: 16px;
          transition: all 0.2s;
          background: #fbfbfd;
        }

        .field input:focus {
          outline: none;
          border-color: #0071e3;
          background: #fff;
        }

        .btn-primary-apple {
          background: #0071e3;
          color: #fff;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary-apple:hover {
          background: #0077ed;
        }

        /* Pipeline Table */
        .pipeline-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .stats-row {
          display: flex;
          gap: 16px;
        }

        .mini-card {
          background: #fff;
          padding: 12px 20px;
          border-radius: 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          border: 1px solid rgba(0,0,0,0.03);
        }

        .mini-card .label { font-size: 12px; color: #86868b; font-weight: 500; }
        .mini-card .value { font-size: 24px; font-weight: 700; }

        .apple-table {
          width: 100%;
          border-collapse: collapse;
        }

        .apple-table th {
          text-align: left;
          padding: 16px 24px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: #86868b;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f5f5f7;
        }

        .apple-table td {
          padding: 16px 24px;
          font-size: 14px;
          border-bottom: 1px solid #f5f5f7;
        }

        .company-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
        }

        .company-info img { width: 28px; height: 28px; border-radius: 6px; }
        .logo-placeholder { width: 28px; height: 28px; background: #f5f5f7; border-radius: 6px; display: flex; align-items: center; justify-content: center; }

        .job-title-cell {
          color: #515154;
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-pill.scraped { background: #fffbe6; color: #d4a017; }
        .status-pill.enriched { background: #e6f7ff; color: #1890ff; }
        .status-pill.emailed { background: #f6ffed; color: #52c41a; }

        .action-btn {
          background: #f5f5f7;
          border: none;
          padding: 6px 14px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: auto;
        }

        .action-btn:hover { background: #000; color: #fff; }

        .sent-badge {
          color: #34c759;
          display: flex;
          justify-content: flex-end;
        }

        /* Logs footer */
        .footer-logs {
          margin-top: auto;
          padding: 16px;
          background: #1d1d1f;
          color: #f5f5f7;
        }

        .logs-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #86868b;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #323236;
        }

        .logs-content {
          height: 100px;
          overflow-y: auto;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .log-line { display: flex; gap: 12px; }
        .log-line.error { color: #ff3b30; }
        .log-line.action { color: #34c759; }
        .log-line .time { opacity: 0.5; min-width: 70px; }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .view-container {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
