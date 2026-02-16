
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, MapPin, Camera, ArrowRight, Package, Wallet, TrendingUp, History, TrendingDown, ChevronRight, ShoppingBag, MessageCircle } from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputTicket, setInputTicket] = useState<{ [key: string]: string }>({});
  const [showAccounting, setShowAccounting] = useState(false);

  const fetchJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data.reverse()); 
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(() => fetchJobs(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const acceptJob = async (id: string, e: any) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'taken' }),
      });

      if (res.status === 409) {
        const errorData = await res.json();
        alert(errorData.error);
        fetchJobs(); 
        return;
      }

      if (!res.ok) throw new Error('Failed to accept job');
      fetchJobs(); 
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'acceptation");
    }
  };

  const validateReceipt = async (id: string, reward: string) => {
    const price = inputTicket[id] || "0";
    const rewardVal = parseFloat(reward.replace('€', '').replace(',', '.'));
    const ticketVal = parseFloat(price.replace(',', '.'));
    const totalToCollect = (rewardVal + ticketVal).toFixed(2);

    try {
      await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status: 'delivering', 
          ticketPrice: ticketVal, 
          totalToCollect 
        }),
      });
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const completeJob = async (id: string, e: any) => {
    e.stopPropagation();
    try {
      if (confirm("Confirmez-vous avoir livré la commande ? Le client sera débité du montant final automatiquement.")) {
        await fetch('/api/jobs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'completed' }),
        });
        fetchJobs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Stats Logic
  const completedJobs = useMemo(() => jobs.filter(j => j.status === 'completed'), [jobs]);
  const totalEarnings = useMemo(() => {
    return completedJobs.reduce((acc, j) => acc + parseFloat(j.reward.replace('€', '').replace(',', '.')), 0).toFixed(2);
  }, [completedJobs]);

  const earningsByDay = useMemo(() => {
    // Mock simulation: split completed jobs into today and yesterday
    const today = completedJobs.slice(0, Math.ceil(completedJobs.length / 2));
    return today.reduce((acc, j) => acc + parseFloat(j.reward.replace('€', '').replace(',', '.')), 0).toFixed(2);
  }, [completedJobs]);

  const myActiveJobs = useMemo(() => jobs.filter(j => ['taken', 'delivering'].includes(j.status)).slice(0, 5), [jobs]);
  const availableJobs = useMemo(() => jobs.filter(j => j.status === 'open').slice(0, 40), [jobs]);

  return (
    <div style={{
      minHeight: '100vh', 
      background: '#f5f5f7', 
      color: '#1d1d1f', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      
      {/* Discreet Header */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px'}}>
        <button onClick={() => showAccounting ? setShowAccounting(false) : router.push('/')} style={{
          background: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
           <ArrowLeft size={20} color="#1d1d1f" />
        </button>
        <div style={{fontWeight: '700', fontSize: '17px'}}>{showAccounting ? 'Comptabilité' : 'Missions'}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!showAccounting && (
            <button onClick={() => setShowAccounting(true)} style={{
              background: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
               <Wallet size={20} color="#007AFF" />
            </button>
          )}
        </div>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        
        {myActiveJobs.length === 0 && availableJobs.length === 0 && !showAccounting && (
          <div style={{ 
            textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '28px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>☕️</div>
            <div style={{ fontWeight: '700', fontSize: '17px', color: '#1d1d1f', marginBottom: '4px' }}>Calme plat à Strasbourg</div>
            <div style={{ fontSize: '14px', color: '#86868b' }}>Aucune nouvelle mission pour le moment. Reposez-vous bien !</div>
          </div>
        )}

        {showAccounting ? (
          <div className="animate-enter">
            {/* ACCOUNTING HUB */}
            <div style={{ background: 'white', borderRadius: '28px', padding: '32px 24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#86868b', marginBottom: '8px' }}>Solde disponible</div>
                <div style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-1px', color: '#1d1d1f' }}>{totalEarnings}€</div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', color: '#34c759', background: '#f2fcf5', padding: '8px 16px', borderRadius: '20px', width: 'fit-content', margin: '20px auto 0 auto' }}>
                  <TrendingUp size={16} />
                  <span style={{ fontSize: '14px', fontWeight: '700' }}>+{earningsByDay}€ aujourd'hui</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#86868b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Missions</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{completedJobs.length}</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#86868b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Dist. est.</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{completedJobs.length * 4.2}km</div>
              </div>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '16px', marginLeft: '4px' }}>Historique récent</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {completedJobs.map(job => (
                <div key={job.id} style={{ background: 'white', padding: '16px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ width: '40px', height: '40px', background: '#f2f2f7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {job.type === 'colis' ? <Package size={20} color="#86868b" /> : <ShoppingBag size={20} color="#86868b" />}
                     </div>
                     <div>
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>{job.type === 'colis' ? 'Livraison Colis' : 'Courses'}</div>
                        <div style={{ fontSize: '12px', color: '#86868b' }}>
                          Terminée • {job.location.split(',')[0]}
                          {job.deliveryFee && ` • Frais: ${job.deliveryFee.toFixed(2)}€`}
                        </div>
                     </div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#1d1d1f' }}>+{job.reward}</div>
                </div>
              ))}
              {completedJobs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#86868b' }}>
                   Aucune mission terminée pour le moment.
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* SECTION: MISSION EN COURS */}
            {myActiveJobs.length > 0 && (
              <div>
                <div style={{fontSize: '13px', fontWeight: '700', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', marginLeft: '4px'}}>
                  Mission en cours
                </div>
                {myActiveJobs.map((job) => (
                   <div key={job.id} style={{
                     background: 'white', borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden',
                     boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)'
                   }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{fontSize: '15px', color: '#86868b'}}>{job.user}</div>
                            <button onClick={() => alert("Ouverture du chat avec le client...")} style={{
                              background: '#f2f2f7', border: 'none', borderRadius: '50%', width: '38px', height: '38px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007AFF'
                            }}>
                               <MessageCircle size={18} />
                            </button>
                          </div>
                          
                          {job.type === 'colis' ? (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingTop: '4px' }}>
                                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#007AFF' }}></div>
                                 <div style={{ width: '1px', height: '20px', background: '#d2d2d7' }}></div>
                                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34c759' }}></div>
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>{job.pickupLocation}</div>
                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{job.location}</div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#007AFF', fontWeight: '600', marginBottom: '16px'}}>
                                <MapPin size={16} /> {job.location}
                              </div>
                              
                              <div style={{ background: '#f5f5f7', borderRadius: '16px', padding: '16px', marginBottom: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#86868b', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <ShoppingBag size={12} /> Liste de courses ({job.items?.length})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {job.items?.map((item: any, idx: number) => (
                                    <div key={idx} style={{ fontSize: '14px', fontWeight: '500', color: '#1d1d1f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ width: '4px', height: '4px', background: '#d2d2d7', borderRadius: '50%' }}></div>
                                      {typeof item === 'string' ? item : item.name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{fontSize: '24px', fontWeight: '800', marginLeft: '12px'}}>{job.reward}</div>
                      </div>

                      {job.status === 'taken' ? (
                        <div style={{background: '#f2f2f7', borderRadius: '16px', padding: '16px', textAlign: 'center'}}>
                           {job.type === 'colis' ? (
                             <button onClick={() => validateReceipt(job.id, job.reward)} style={{
                               width: '100%', background: '#007AFF', color: 'white', border: 'none', borderRadius: '12px', padding: '16px', fontWeight: '700',
                               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                             }}>
                               <Package size={20} /> Colis Récupéré
                             </button>
                           ) : (
                             !inputTicket[job.id] ? (
                               <div onClick={() => {
                                 const randomTotal = (Math.random() * (30 - 5) + 5).toFixed(2);
                                 setInputTicket({...inputTicket, [job.id]: randomTotal});
                               }} style={{cursor: 'pointer'}}>
                                  <Camera size={32} style={{margin: '0 auto 8px auto', display: 'block'}} color="#86868b" />
                                  <div style={{fontSize: '14px', fontWeight: '600', color: '#1d1d1f'}}>Scanner le ticket</div>
                               </div>
                             ) : (
                               <>
                                 <div style={{fontSize: '28px', fontWeight: '800', color: '#007AFF', marginBottom: '12px'}}>{inputTicket[job.id]} €</div>
                                 <button onClick={() => validateReceipt(job.id, job.reward)} style={{
                                   width: '100%', background: '#007AFF', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: '600'
                                 }}>Valider le prix</button>
                               </>
                             )
                           )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ background: '#f2f2f7', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <div style={{ fontSize: '13px', fontWeight: '600', color: '#86868b' }}>Total Client (Ticket + Pourboire)</div>
                             <div style={{ fontSize: '17px', fontWeight: '800', color: '#1d1d1f' }}>{job.totalToCollect}€</div>
                          </div>
                          <button onClick={(e) => completeJob(job.id, e)} style={{
                            width: '100%', background: '#34c759', color: 'white', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: '700', fontSize: '16px'
                          }}>Confirmer la Livraison</button>
                        </div>
                      )}
                   </div>
                ))}
              </div>
            )}

            {/* SECTION: MISSIONS DISPONIBLES */}
            {availableJobs.length > 0 && (
              <div>
                <div style={{fontSize: '13px', fontWeight: '700', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', marginLeft: '4px'}}>
                  Missions disponibles
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {availableJobs.map((job) => (
                    <div key={job.id} style={{
                      background: 'white', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)'
                    }}>
                      <div style={{flex: 1, minWidth: 0}}>
                        <div style={{fontSize: '12px', color: '#86868b', marginBottom: '2px'}}>{job.user}</div>
                        {job.type === 'colis' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <span style={{ fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{job.pickupLocation}</span>
                            <ArrowRight size={12} color="#d2d2d7" />
                            <span style={{ fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{job.location}</span>
                          </div>
                        ) : (
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1d1d1f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={14} color="#007AFF" /> 
                            <span>{job.location ? job.location.split(',')[0] : 'Adresse inconnue'}</span>
                            <span style={{ color: '#86868b', fontSize: '12px', fontWeight: '500' }}>({job.items?.length || 0} art.)</span>
                          </div>
                        )}
                      </div>
                      <div style={{textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '8px'}}>
                        <div style={{fontWeight: '700', color: '#34c759', fontSize: '15px'}}>{job.reward}</div>
                        <button onClick={(e) => acceptJob(job.id, e)} style={{
                          background: '#1d1d1f', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', fontWeight: '600'
                        }}>Prendre</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>

    </div>
  );
}
