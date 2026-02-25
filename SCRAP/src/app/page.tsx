"use client";

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Target, 
  Mail, 
  Play, 
  Search, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  Linkedin, 
  ExternalLink, 
  Settings, 
  Activity,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';

// Types
interface ScrapedLead {
  id: string;
  name: string;
  title: string;
  source: string;
  url: string;
  logo?: string;
  email?: string;
  status: 'scraped' | 'enriched' | 'emailed' | 'archived';
  date: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'leads' | 'discover' | 'status'>('leads');
  const [leads, setLeads] = useState<ScrapedLead[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [location, setLocation] = useState('Strasbourg');
  const [keywords, setKeywords] = useState('Développeur');

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    const res = await fetch('/api/leads');
    const data = await res.json();
    if (data.success) setLeads(data.leads.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const fetchSystemStatus = async () => {
    const res = await fetch('/api/status');
    const data = await res.json();
    setSystemStatus(data);
  };

  const startDiscovery = async () => {
    setIsScraping(true);
    await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords, location })
    });
    await fetchLeads();
    setActiveTab('leads');
    setIsScraping(false);
  };

  const runFullSequence = async (lead: ScrapedLead) => {
    setIsProcessing(lead.id);
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: lead.url, companyName: lead.name })
    });
    const data = await res.json();

    const grokRes = await fetch('/api/grok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `Candidature pour ${lead.name}`, domain: lead.url, name: lead.name })
    });
    const grokData = await grokRes.json();

    setPreviewData({
      lead,
      subject: grokData.agents.subject,
      prospectName: lead.name,
      pitch: grokData.agents.copywriter,
      lm: grokData.agents.lm,
      targetEmail: data.leads?.[0]?.email || "",
      linkedinUrl: data.leads?.[0]?.linkedinUrl || "",
      cc: data.leads?.slice(1).map((l: any) => l.email) || []
    });
    setIsProcessing(null);
  };

  const confirmAndSend = async () => {
    const { lead, subject, pitch, lm, targetEmail, cc } = previewData;
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail: targetEmail, companyName: lead.name, icebreaker: pitch, lm, subject, cc })
    });
    await fetch('/api/leads', { method: 'POST', body: JSON.stringify({ id: lead.id, status: 'emailed' }) });
    fetchLeads();
    setPreviewData(null);
  };

  return (
    <div className="apple-container">
      {/* Universal Header */}
      <header className="apple-header">
        <div className="header-inner">
          <div className="logo-section">
            <div className="reach-dot"></div>
            <span className="logo-text">Reach</span>
          </div>
          
          <nav className="apple-nav">
            <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>Pipeline</button>
            <button className={activeTab === 'discover' ? 'active' : ''} onClick={() => setActiveTab('discover')}>Discovery</button>
            <button className={activeTab === 'status' ? 'active' : ''} onClick={() => {setActiveTab('status'); fetchSystemStatus();}}>Status</button>
          </nav>

          <div className="header-actions">
            <div className={`pulse-dot ${systemStatus?.hunter?.status === 'active' ? 'online' : 'offline'}`}></div>
          </div>
        </div>
      </header>

      <main className="apple-main">
        {/* VIEW: PIPELINE */}
        {activeTab === 'leads' && (
          <div className="fade-in">
            <div className="view-header">
              <h1>Your Pipeline</h1>
              <p>{leads.length} opportunities tracking.</p>
            </div>

            <div className="leads-list">
              {leads.filter(l => l.status !== 'archived').length === 0 ? (
                <div className="p-12 text-center text-gray-400">No leads yet. Launch a discovery.</div>
              ) : (
                leads.filter(l => l.status !== 'archived').map(lead => (
                  <div key={lead.id} className="lead-row">
                    <div className="lead-main">
                      <div className="lead-icon">
                        {lead.logo ? <img src={lead.logo} alt="" /> : <Building2 size={20} className="text-gray-400" />}
                      </div>
                      <div className="lead-meta">
                        <h3>{lead.name}</h3>
                        <p>{lead.title}</p>
                      </div>
                    </div>

                    <div className="lead-actions">
                      <span className={`badge ${lead.status}`}>{lead.status}</span>
                      {lead.status !== 'emailed' ? (
                        <button 
                          className="btn-reach" 
                          onClick={() => runFullSequence(lead)}
                          disabled={isProcessing === lead.id}
                        >
                          {isProcessing === lead.id ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                          Reach
                        </button>
                      ) : (
                        <CheckCircle2 size={20} className="text-green-500" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW: DISCOVERY */}
        {activeTab === 'discover' && (
          <div className="discover-center fade-in">
            <div className="hero-text">
              <h1>New Discovery</h1>
              <p>Identify decision makers in any market.</p>
            </div>

            <div className="discovery-card">
              <div className="input-group">
                <label>Keywords</label>
                <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. Startup Tech" />
              </div>
              <div className="input-group">
                <label>Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Strasbourg" />
              </div>
              <button className="btn-action" onClick={startDiscovery} disabled={isScraping}>
                {isScraping ? <Loader2 className="animate-spin" /> : "Scan Market"}
              </button>
            </div>
          </div>
        )}

        {/* VIEW: STATUS */}
        {activeTab === 'status' && (
          <div className="fade-in">
            <div className="view-header text-center">
              <h1>System Integrity</h1>
              <p>Real-time status of your surgical outreach engine.</p>
            </div>

            <div className="status-grid">
              {['apollo', 'hunter', 'grok', 'zerobounce'].map(service => (
                <div key={service} className="status-item">
                  <div className="item-top">
                    <span className="capitalize font-semibold">{service}</span>
                    <div className={`indicator ${systemStatus?.[service]?.status === 'active' ? 'ok' : 'err'}`}></div>
                  </div>
                  <div className="item-meta">
                    {systemStatus?.[service]?.quota || systemStatus?.[service]?.credits || "Checked"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: PREVIEW */}
      {previewData && (
        <div className="apple-modal-overlay">
          <div className="apple-modal">
            <div className="modal-top">
              <h2>Review Candidature</h2>
              <button onClick={() => setPreviewData(null)}>Dismiss</button>
            </div>
            
            <div className="modal-content">
              <div className="content-section">
                <label>Recipient</label>
                <input 
                  className="minimal-input"
                  value={previewData.targetEmail} 
                  onChange={e => setPreviewData({...previewData, targetEmail: e.target.value})}
                />
              </div>

              {previewData.linkedinUrl && (
                <a href={previewData.linkedinUrl} target="_blank" className="linkedin-shortcut">
                  <Linkedin size={16} /> Open LinkedIn Profile
                </a>
              )}

              <div className="content-section">
                <label>Personalized Pitch</label>
                <textarea 
                  className="minimal-area"
                  value={previewData.lm} 
                  onChange={e => setPreviewData({...previewData, lm: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-bottom">
              <button className="btn-send" onClick={confirmAndSend}>Dispatch via Gmail</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        :root {
          --apple-blue: #0071e3;
          --apple-gray: #f5f5f7;
          --apple-text: #1d1d1f;
        }

        body {
          margin: 0;
          background: #ffffff;
          color: var(--apple-text);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .apple-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Nav Header */
        .apple-header {
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: saturate(180%) blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          z-index: 1000;
          padding: 0 20px;
        }

        .header-inner {
          max-width: 1000px;
          margin: 0 auto;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-section { display: flex; align-items: center; gap: 8px; }
        .reach-dot { width: 10px; height: 10px; background: #000; border-radius: 50%; }
        .logo-text { font-weight: 600; font-size: 17px; letter-spacing: -0.02em; }

        .apple-nav { display: flex; gap: 32px; }
        .apple-nav button {
          background: none; border: none; font-size: 14px; color: #86868b; cursor: pointer;
          transition: color 0.2s; font-weight: 400;
        }
        .apple-nav button:hover { color: #1d1d1f; }
        .apple-nav button.active { color: #1d1d1f; font-weight: 500; }

        /* Main Area */
        .apple-main {
          max-width: 800px;
          margin: 60px auto;
          width: 100%;
          padding: 0 20px;
        }

        h1 { font-size: 40px; font-weight: 700; letter-spacing: -0.03em; margin: 0; }
        .view-header p { color: #86868b; font-size: 19px; margin-top: 8px; }

        /* Leads List */
        .leads-list { margin-top: 48px; display: flex; flex-direction: column; gap: 1px; background: #f5f5f7; border-radius: 18px; overflow: hidden; border: 1px solid #f5f5f7; }
        .lead-row {
          background: #ffffff; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;
          transition: background 0.2s;
        }
        .lead-row:hover { background: #fafafa; }

        .lead-main { display: flex; align-items: center; gap: 16px; }
        .lead-icon { width: 44px; height: 44px; background: #f5f5f7; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .lead-icon img { width: 100%; height: 100%; object-fit: cover; }
        
        .lead-meta h3 { margin: 0; font-size: 17px; font-weight: 600; }
        .lead-meta p { margin: 0; font-size: 14px; color: #86868b; }

        .lead-actions { display: flex; align-items: center; gap: 16px; }
        .badge { font-size: 12px; font-weight: 600; text-transform: capitalize; padding: 2px 8px; border-radius: 6px; }
        .badge.scraped { background: #f5f5f7; color: #86868b; }
        .badge.emailed { background: #e6ffed; color: #1d8036; }

        .btn-reach {
          background: #000; color: #fff; border: none; padding: 8px 16px; border-radius: 20px;
          font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-reach:hover { opacity: 0.8; }

        /* Discovery */
        .discover-center { text-align: center; max-width: 500px; margin: 0 auto; }
        .discovery-card { background: #f5f5f7; padding: 40px; border-radius: 28px; margin-top: 40px; display: flex; flex-direction: column; gap: 24px; }
        
        .input-group { text-align: left; }
        .input-group label { display: block; font-size: 12px; font-weight: 600; color: #86868b; text-transform: uppercase; margin-bottom: 8px; margin-left: 4px; }
        .input-group input {
          width: 100%; padding: 14px 18px; border-radius: 14px; border: 1px solid #d2d2d7;
          font-size: 16px; outline: none; transition: border 0.2s; box-sizing: border-box;
        }
        .input-group input:focus { border-color: var(--apple-blue); }

        .btn-action {
          background: var(--apple-blue); color: #fff; border: none; padding: 16px; border-radius: 14px;
          font-size: 17px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;
        }

        /* Status */
        .status-grid { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .status-item { background: #f5f5f7; padding: 24px; border-radius: 18px; }
        .item-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .indicator { width: 8px; height: 8px; border-radius: 50%; }
        .indicator.ok { background: #34c759; box-shadow: 0 0 8px rgba(52, 199, 89, 0.4); }
        .indicator.err { background: #ff3b30; }
        .item-meta { font-size: 14px; color: #86868b; }

        /* Modal */
        .apple-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.2); backdrop-filter: blur(20px);
          display: flex; align-items: center; justify-content: center; z-index: 2000;
        }
        .apple-modal {
          background: #fff; width: 100%; max-width: 600px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden; animation: modalIn 0.3s ease-out;
        }
        .modal-top { padding: 24px 32px; border-bottom: 1px solid #f5f5f7; display: flex; justify-content: space-between; align-items: center; }
        .modal-top h2 { margin: 0; font-size: 20px; font-weight: 600; }
        .modal-top button { background: none; border: none; color: var(--apple-blue); font-size: 15px; cursor: pointer; }

        .modal-content { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
        .content-section label { display: block; font-size: 11px; font-weight: 700; color: #86868b; text-transform: uppercase; margin-bottom: 6px; }
        .minimal-input { width: 100%; border: none; font-size: 17px; font-weight: 500; padding: 0; outline: none; }
        .minimal-area { width: 100%; height: 200px; border: none; font-size: 15px; font-weight: 400; padding: 0; outline: none; resize: none; line-height: 1.5; color: #424245; }
        
        .linkedin-shortcut { display: flex; align-items: center; gap: 8px; color: #0077b5; font-size: 14px; font-weight: 500; text-decoration: none; }
        
        .modal-bottom { padding: 24px 32px; background: #f5f5f7; border-top: 1px solid rgba(0,0,0,0.05); text-align: right; }
        .btn-send { background: #000; color: #fff; border: none; padding: 12px 24px; border-radius: 24px; font-size: 15px; font-weight: 600; cursor: pointer; }

        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; }
        .pulse-dot.online { background: #34c759; }
        .pulse-dot.offline { background: #ff3b30; }

        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
