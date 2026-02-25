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
  MoreHorizontal,
  Archive,
  History,
  RotateCcw
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

const JOB_TITLES = [
  "Développeur Fullstack",
  "Développeur React",
  "Développeur Node.js",
  "Développeur Python",
  "Stage Développeur Web",
  "Alternance Développeur",
  "Développeur Mobile",
  "Lead Developer",
  "Software Engineer",
  "CTO",
  "Product Manager"
];

const LOCATIONS = [
  "Strasbourg",
  "Paris",
  "Lyon",
  "Bordeaux",
  "Nantes",
  "Montreal",
  "London",
  "Remote"
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'leads' | 'discover' | 'status' | 'archive'>('leads');
  const [leads, setLeads] = useState<ScrapedLead[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  // Discovery Form
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Filter suggestions
  const filteredKeywords = JOB_TITLES.filter(t =>
    t.toLowerCase().includes(keywords.toLowerCase()) && keywords.length > 0
  );

  const filteredLocations = LOCATIONS.filter(l =>
    l.toLowerCase().includes(location.toLowerCase()) && location.length > 0
  );

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const res = await fetch('/api/leads');
    const data = await res.json();
    if (data.success && Array.isArray(data.leads)) {
      setLeads(data.leads.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else {
      setLeads([]);
    }
  };

  const fetchSystemStatus = async () => {
    const res = await fetch('/api/status');
    const data = await res.json();
    setSystemStatus(data);
  };

  const startDiscovery = async () => {
    setIsScraping(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, location })
      });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
        setActiveTab('leads');
      } else {
        alert("Discovery Error: " + (data.error || data.message || "No results found. Re-check your API quotas."));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsScraping(false);
    }
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
    // Update status to emailed
    await fetch('/api/leads', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, status: 'emailed' }) 
    });
    fetchLeads();
    setPreviewData(null);
  };

  const archiveLead = async (id: string) => {
    await fetch('/api/leads', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'archived' }) 
    });
    fetchLeads();
  };

  const unarchiveLead = async (id: string) => {
    // Restore to its previous logic (if it was emailed, keep it emailed but not archived)
    // For simplicity, we just move back to pipeline
    await fetch('/api/leads', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'scraped' }) 
    });
    fetchLeads();
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
            <button className={activeTab === 'archive' ? 'active' : ''} onClick={() => setActiveTab('archive')}>Archive</button>
            <button className={activeTab === 'discover' ? 'active' : ''} onClick={() => setActiveTab('discover')}>Discovery</button>
            <button className={activeTab === 'status' ? 'active' : ''} onClick={() => {setActiveTab('status'); fetchSystemStatus();}}>Status</button>
          </nav>

          <div className="header-actions">
            <button className="btn-clean" onClick={async () => { await fetch('/api/leads', { method: 'DELETE' }); fetchLeads(); }}>
              Clean
            </button>
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
                    {new Date(lead.date).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                      <div className="unread-dot"></div>
                    )}
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
                        <div className="flex items-center gap-2">
                          <button 
                            className="btn-reach" 
                            onClick={() => runFullSequence(lead)}
                            disabled={isProcessing === lead.id}
                          >
                            {isProcessing === lead.id ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                            Reach
                          </button>
                          <button className="icon-btn" title="Archiver" onClick={() => archiveLead(lead.id)}>
                            <Archive size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                           <CheckCircle2 size={20} className="text-green-500" />
                           <button className="icon-btn primary" title="Déplacer vers archive" onClick={() => archiveLead(lead.id)}>
                              <History size={18} />
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW: ARCHIVE */}
        {activeTab === 'archive' && (
          <div className="fade-in">
            <div className="view-header">
              <h1>Vault</h1>
              <p>Storage for processed opportunities.</p>
            </div>

            <div className="leads-list archived-list">
              {leads.filter(l => l.status === 'archived').length === 0 ? (
                <div className="p-12 text-center text-gray-400">Archive is empty.</div>
              ) : (
                leads.filter(l => l.status === 'archived').map(lead => (
                  <div key={lead.id} className="lead-row archived">
                    <div className="lead-main">
                      <div className="lead-icon grayscale">
                        {lead.logo ? <img src={lead.logo} alt="" /> : <Building2 size={20} className="text-gray-400" />}
                      </div>
                      <div className="lead-meta opacity-60">
                        <h3>{lead.name}</h3>
                        <p>{lead.title}</p>
                      </div>
                    </div>

                    <div className="lead-actions">
                      <button className="btn-clean" onClick={() => unarchiveLead(lead.id)}>
                        <RotateCcw size={14} style={{marginRight: '6px'}} /> Restore
                      </button>
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
              <div className="input-group relative">
                <label>Keywords</label>
                <input 
                  value={keywords} 
                  onChange={e => { setKeywords(e.target.value); setShowKeywordSuggestions(true); }}
                  onFocus={() => setShowKeywordSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowKeywordSuggestions(false), 200)}
                  placeholder="e.g. Startup Tech" 
                />
                {showKeywordSuggestions && filteredKeywords.length > 0 && (
                  <div className="suggestions-dropdown">
                    {filteredKeywords.map(k => (
                      <div key={k} className="suggestion-item" onClick={() => { setKeywords(k); setShowKeywordSuggestions(false); }}>
                        {k}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-group relative">
                <label>Location</label>
                <input 
                  value={location} 
                  onChange={e => { setLocation(e.target.value); setShowLocationSuggestions(true); }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                  placeholder="e.g. Strasbourg" 
                />
                {showLocationSuggestions && filteredLocations.length > 0 && (
                  <div className="suggestions-dropdown">
                    {filteredLocations.map(l => (
                      <div key={l} className="suggestion-item" onClick={() => { setLocation(l); setShowLocationSuggestions(false); }}>
                        {l}
                      </div>
                    ))}
                  </div>
                )}
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
          transition: background 0.2s; position: relative;
        }
        .lead-row:hover { background: #fafafa; }

        .lead-main { display: flex; align-items: center; gap: 16px; }
        .lead-icon { width: 44px; height: 44px; background: #f5f5f7; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .lead-icon img { width: 100%; height: 100%; object-fit: cover; }
        
        .title-row { display: flex; align-items: center; gap: 10px; }
        .lead-meta h3 { margin: 0; font-size: 17px; font-weight: 600; }
        .lead-meta p { margin: 0; font-size: 14px; color: #86868b; }

        .unread-dot {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background-color: #007aff;
          border-radius: 50%;
        }

        .lead-actions { display: flex; align-items: center; gap: 16px; }
        .badge { font-size: 12px; font-weight: 600; text-transform: capitalize; padding: 2px 8px; border-radius: 6px; }
        .badge.scraped { background: #f5f5f7; color: #86868b; }
        .badge.emailed { background: #e6ffed; color: #1d8036; }

        .icon-btn {
          background: none; border: none; color: #86868b; cursor: pointer; padding: 8px;
          border-radius: 50%; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .icon-btn:hover { background: #f5f5f7; color: #1d1d1f; }
        .icon-btn.primary { color: var(--apple-blue); }
        .icon-btn.primary:hover { background: #e8f3ff; }

        .archived-list { background: #fafafa; border-color: #eee; }
        .lead-row.archived { background: #fafafa; }
        .opacity-60 { opacity: 0.6; }
        .grayscale { filter: grayscale(1); opacity: 0.5; }

        .btn-reach {
          background: #000; color: #fff; border: none; padding: 8px 16px; border-radius: 20px;
          font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-reach:hover { opacity: 0.8; }

        .btn-clean {
          background: none; border: 1px solid #f5f5f7; color: #ff3b30; padding: 4px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-right: 12px;
        }
        .btn-clean:hover { background: #fff1f0; border-color: #ffa39e; }

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

        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #d2d2d7;
          border-radius: 12px;
          margin-top: 6px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          z-index: 100;
          overflow: hidden;
          text-align: left;
        }

        .suggestion-item {
          padding: 12px 18px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .suggestion-item:hover { background: #f5f5f7; color: var(--apple-blue); }

        .relative { position: relative; }

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
